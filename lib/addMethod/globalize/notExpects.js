/*
* Given a fully normalized `notExpects` object from both the global
* and the local method, return the final `notExpects` object to be used
* in the validation.
*/
var _ 							 = require('lodash');
var normalizeExpects = require('../normalizeExpects');


module.exports = function (config) {

	var globalNotExpects = normalizeExpects(this._globalOptions.notExpects || {});
	var localNotExpects  = normalizeExpects(config.notExpects || {});

	// If globals are false, just return the local not expects
	if (config.globals === false) {
		return [ localNotExpects ];
	}

	// If both global and local not expects are not functions, merge the two
	// objects and pass back an array of one.
	else if (!_.isFunction(globalNotExpects) && !_.isFunction(localNotExpects)) {
		return [ _.defaults(localNotExpects, globalNotExpects) ];
	}

	// If one of the global or local not expects is a function, return an array of
	// two functions to be executed sequentially. Global not expects will be executed
	// before local expects.
	else {
		return [ globalNotExpects, localNotExpects ];
	}

};
