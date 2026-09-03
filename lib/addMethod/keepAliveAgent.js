/*
* TCP keep-alive, so a call still waiting on a slow API is not dropped by the
* AWS NAT gateway's 350 second idle timeout.
* See https://repost.aws/knowledge-center/lambda-vpc-timeout
*
* Not HTTP keep-alive: Node's `keepAlive: true` pools connections between
* requests and only arms the socket once it returns to the pool, after the
* response - too late. So this agent does not pool. It exists only to arm the
* socket as it is created.
*
* Switch off with `disableKeepAliveAgent` - see globalize/disableKeepAliveAgent.js
*/
const http  = require('http');
const https = require('https');

const logger = require('../logger');

/*
* Idle time before the first probe, and the gap between probes thereafter, since
* an answered probe resets the timer. Under the gateway's 350 seconds with
* margin, so one probe per idle period is enough.
*/
const KEEPALIVE_DELAY = 300000;

//Real agents, used only for their `createConnection`, so TLS setup stays Node's job
const factories = {
	'http:': new http.Agent({ keepAlive: false }),
	'https:': new https.Agent({ keepAlive: false })
};

class KeepAliveAgent extends http.Agent {

	constructor (options) {
		super(options);

		/*
		  Node only rejects a protocol mismatch when the agent declares one, and
		  this agent serves both. Declaring none is also what keeps redirects
		  working, since needle reuses the same agent for the redirect target.
		*/
		this.protocol = undefined;
	}

	createConnection (options, callback) {
		/*
		  needle sets this per request: the proxy's protocol when proxying, else
		  the target's. It dispatches anything but `https:` through http, so the
		  fallback mirrors that - a TLS socket there would break the request
		  rather than secure it, since needle would still be speaking http.
		*/
		const factory = ( factories[options.protocol] || factories['http:'] );

		const socket = factory.createConnection(options, callback);
		socket.setKeepAlive(true, KEEPALIVE_DELAY); //set SO_KEEPALIVE

		return socket;
	}

}

//A caller's own `agent` is returned untouched, so `agent: false` stays an opt-out
module.exports = function resolveKeepAliveAgent (options, disabled) {

	if (options.agent !== undefined) {
		return options.agent;
	}

	//`disableKeepAliveAgent`, set on the method or the connector's globals
	if (disabled === true) {
		logger.info('keep-alive agent disabled by configuration; not attaching one');
		return undefined;
	}

	/*
	  One per request, not shared: needle writes TLS options (`rejectUnauthorized`,
	  `cert`, `key`, ...) onto `agent.options`, so sharing would leak one method's
	  TLS settings into later requests. Agents open no sockets, so this is free.
	*/
	return new KeepAliveAgent({ keepAlive: false });

};

module.exports.KEEPALIVE_DELAY = KEEPALIVE_DELAY;
module.exports.KeepAliveAgent = KeepAliveAgent;
module.exports.factories = factories;
