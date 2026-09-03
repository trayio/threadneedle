/*
* TCP keep-alive for long-running API calls.
*
* AWS NAT gateways drop connections that sit idle for 350 seconds, so a call
* that waits a long time for its response is killed mid-flight even when there
* is Lambda budget left. The fix is SO_KEEPALIVE on the socket, as AWS
* themselves prescribe: https://repost.aws/knowledge-center/lambda-vpc-timeout
*
* Note this is *not* HTTP keep-alive. Node's `keepAlive: true` means reusing
* connections between requests, and it applies `keepAliveMsecs` only in
* `keepSocketAlive()`, called once a socket is handed back to the pool - after
* the response, and so too late for the socket we care about. This agent
* therefore deliberately does not pool. It exists only to get hold of the socket
* as it is created, leaving socket lifetime as it was before it existed.
*
* Can be turned off per method or per connector with
* `disableKeepAliveAgent: true` - see globalize/disableKeepAliveAgent.js.
*/
const http  = require('http');
const https = require('https');

const logger = require('../logger');

/*
* Idle time before a keep-alive probe is sent. A probe answered by a healthy
* peer resets the idle timer, so this is also the effective interval between
* probes - TCP_KEEPINTVL only governs retries of an *unanswered* probe.
*
* Sized under the AWS NAT gateway's 350 second idle timeout with 50 seconds of
* margin, so a single probe per idle period is enough to reset the gateway's
* timer. AWS's example uses 1000ms, which probes far more often than is needed
* here for no additional benefit.
*/
const KEEPALIVE_DELAY = 300000;

/*
* Connection factories, one per protocol. These are real agents, used purely
* for their `createConnection`, so that TLS setup - servername, ALPN, session
* resumption - remains Node's job rather than something reimplemented here.
*/
const factories = {
	'http:': new http.Agent({ keepAlive: false }),
	'https:': new https.Agent({ keepAlive: false })
};

class KeepAliveAgent extends http.Agent {

	constructor (options) {
		super(options);

		/*
		  Node throws ERR_INVALID_PROTOCOL when an agent declares a protocol
		  that differs from the request's, and only performs that check when the
		  agent declares one at all. This agent serves either protocol, choosing
		  per connection below, so it declares none.

		  This matters for redirects: needle follows them by re-entering
		  `send_request` with the same config object, so the agent chosen for the
		  first request is reused for the redirect target. An agent fixed to one
		  protocol would throw - uncaught, from inside needle's response handler
		  - as soon as a request crossed from http to https or back.
		*/
		this.protocol = undefined;
	}

	createConnection (options, callback) {
		/*
		  `options.protocol` is set per request by needle, from the proxy's url
		  when proxying and the target's otherwise, so it describes the socket
		  actually being opened rather than where the request started.
		*/
		const factory = ( factories[options.protocol] || factories['http:'] );

		const socket = factory.createConnection(options, callback);
		socket.setKeepAlive(true, KEEPALIVE_DELAY); //set SO_KEEPALIVE

		return socket;
	}

}

/*
* Resolve the agent for a single request. Returns the caller's own `agent`
* untouched when they set one, so `agent: false` remains a deliberate opt-out.
*/
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
	  Deliberately one agent per request rather than a shared instance. When an
	  agent is present, needle assigns TLS options (`rejectUnauthorized`, `cert`,
	  `key`, `pfx`, ...) onto `agent.options` rather than onto the request, so a
	  shared agent would let one method's TLS settings or client certificate leak
	  into every later request in the process. Constructing an agent opens no
	  sockets, and there is no pool to preserve, so per-request costs nothing.
	*/
	return new KeepAliveAgent({ keepAlive: false });

};

module.exports.KEEPALIVE_DELAY = KEEPALIVE_DELAY;
module.exports.KeepAliveAgent = KeepAliveAgent;
module.exports.factories = factories;
