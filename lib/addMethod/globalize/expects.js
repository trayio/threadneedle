/*
* Given a fully normalized expects object from both the global
* and the local method, return the final expects object to be used
* in the validation.
*/
var _ 							 = require('lodash');
var normalizeExpects = require('../normalizeExpects');


module.exports = function (config) {

	var globalExpects = normalizeExpects(this._globalOptions.expects || {});
	var localExpects  = normalizeExpects(config.expects || {});

	var localOnly = config.globals === false || _.get(config, 'globals.expects', true) === false;

	// If globals disabled, only pass back local expects in an array of one
	if (localOnly) {
		return [ localExpects ];
	}

	// If both global and local expects are not functions, merge the two
	// objects and pass back an array of one.
	else if (!_.isFunction(globalExpects) && !_.isFunction(localExpects)) {
		return [ _.defaults(localExpects, globalExpects) ];
	}

	// If one of the global or local expects is a function, return an array of
	// two functions to be executed sequentially. Global expects will be executed
	// before local expects.
	else {
		return [ globalExpects, localExpects ];
	}

};
