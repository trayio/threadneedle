/*
* Whether to skip the keep-alive agent. On by default; a method or a connector's
* globals can set `disableKeepAliveAgent: true`, and a method can set it back to
* `false` where its connector disabled it wholesale.
*
* A blanket `globals: false` does not discard this, unlike other globals. The
* flag gets set because keep-alive breaks a service, and `globals: false` is
* common on auth endpoints for unrelated reasons - silently re-enabling the
* agent there would defeat the point. Naming the key does discard it, since
* that is a deliberate statement about this flag rather than collateral.
*
* Hence checking `globals` directly rather than through `localOnly`, which
* cannot tell the blanket opt-out from the per-key one.
*/
const _ = require('lodash');

module.exports = function (config) {

	if (_.isBoolean(config.disableKeepAliveAgent)) {
		return config.disableKeepAliveAgent;
	}

	//`globals: { disableKeepAliveAgent: false }` - drop the global, leaving the default
	if (_.get(config, 'globals.disableKeepAliveAgent') === false) {
		return false;
	}

	if (_.isBoolean(this._globalOptions.disableKeepAliveAgent)) {
		return this._globalOptions.disableKeepAliveAgent;
	}

	return false;

};
