/*
* Whether to skip the keep-alive agent. On by default; a method or a connector's
* globals can set `disableKeepAliveAgent: true`, and a method can set it back to
* `false` where its connector disabled it wholesale.
*
* Unlike other globals, `globals: false` does not discard this. The flag gets
* set because keep-alive breaks a service, and `globals: false` is common on
* auth endpoints for unrelated reasons - silently re-enabling the agent there
* would defeat the point.
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
