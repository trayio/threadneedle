/*
* Whether to skip attaching the TCP keep-alive agent to a request.
*
* The agent is on by default, since the AWS NAT gateway idle timeout it works
* around applies to every outbound call. A method may turn it off with
* `disableKeepAliveAgent: true`, and a connector may turn it off for all of its
* methods by setting the same key in its globals. A method can also turn it
* back on with `disableKeepAliveAgent: false` where its connector has disabled
* it wholesale.
*
* Note this does not consult `localOnly`, so unlike every other global a
* method's `globals: false` does not discard it. That is intentional: the flag
* gets set because keep-alive breaks a service, and `globals: false` is common
* on auth endpoints for unrelated reasons (global headers, baseUrl). Letting it
* silently re-enable the agent on those endpoints would defeat the point.
*/
const _ = require('lodash');

module.exports = function (config) {

	if (_.isBoolean(config.disableKeepAliveAgent)) {
		return config.disableKeepAliveAgent;
	}

	if (_.isBoolean(this._globalOptions.disableKeepAliveAgent)) {
		return this._globalOptions.disableKeepAliveAgent;
	}

	return false;

};
