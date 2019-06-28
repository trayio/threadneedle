/*
* Given a fully normalized `notExpects` object from both the global
* and the local method, return the final `notExpects` object to be used
* in the validation.
*/
var _ 							 = require('lodash');

var normalizeExpects = require('../normalizeExpects');
var localOnly = require('./localOnly');

module.exports = function (config) {

	// If globals are false, just return the local not expects
	if (localOnly(config, 'notExpects')) {
		return [ normalizeExpects(config.notExpects || {}) ];
	}

	//Ordering is significant - if globals true, global should run first
	var globalNotExpects = normalizeExpects(this._globalOptions.notExpects || {});
	var localNotExpects  = normalizeExpects(config.notExpects || {});

	// If both global and local not expects are not functions, merge the two
	// objects and pass back an array of one.
	if (!_.isFunction(globalNotExpects) && !_.isFunction(localNotExpects)) {
		return [ _.defaults(localNotExpects, globalNotExpects) ];
	}

	// If one of the global or local not expects is a function, return an array of
	// two functions to be executed sequentially. Global not expects will be executed
	// before local expects.
	else {
		return [ globalNotExpects, localNotExpects ];
	}

};
