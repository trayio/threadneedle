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
* the response, and so too late for the socket we care about. These agents
* therefore deliberately do not pool. They exist only to get hold of the socket
* as it is created, leaving socket lifetime as it was before they existed.
*/
const http  = require('http');
const https = require('https');

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

function withKeepAlive (Base) {
	return class KeepAliveAgent extends Base {
		createConnection (options, callback) {
			const socket = super.createConnection(options, callback);
			socket.setKeepAlive(true, KEEPALIVE_DELAY); //set SO_KEEPALIVE
			return socket;
		}
	};
}

/*
* An agent is bound to one protocol - Node throws ERR_INVALID_PROTOCOL if it is
* handed a request of the other - so we keep a class per protocol and pick by
* the request's URL.
*/
const agentClasses = {
	'http:': withKeepAlive(http.Agent),
	'https:': withKeepAlive(https.Agent)
};

//needle reads a proxy from the options or the environment, upper case then lower
function isProxied (options) {
	const envProxy = (
		process.env.HTTP_PROXY || process.env.http_proxy ||
		process.env.HTTPS_PROXY || process.env.https_proxy
	);
	return Boolean(options.proxy || envProxy);
}

/*
* Resolve the agent for a single request. Returns the caller's own `agent`
* untouched when they set one, so `agent: false` remains a deliberate opt-out.
*/
module.exports = function resolveAgent (url, options) {

	if (options.agent !== undefined) {
		return options.agent;
	}

	/*
	  Behind a proxy needle connects to the proxy, so the socket's protocol is
	  the proxy's rather than the target's. Rather than duplicate needle's proxy
	  and NO_PROXY resolution, don't attach an agent at all - keep-alive is an
	  optimisation, not a guarantee.
	*/
	if (isProxied(options)) {
		return undefined;
	}

	//needle prepends `http://` when a URL carries no protocol
	const Agent = ( /^https:/i.test(url) ? agentClasses['https:'] : agentClasses['http:'] );

	/*
	  Deliberately one agent per request rather than a shared pair. When an agent
	  is present, needle assigns TLS options (`rejectUnauthorized`, `cert`, `key`,
	  `pfx`, ...) onto `agent.options` rather than onto the request, so a shared
	  agent would let one method's TLS settings or client certificate leak into
	  every later request in the process. Constructing an agent opens no sockets,
	  and there is no pool to preserve, so per-request costs nothing meaningful.
	*/
	return new Agent({ keepAlive: false });

};

module.exports.KEEPALIVE_DELAY = KEEPALIVE_DELAY;
module.exports.agentClasses = agentClasses;
