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

	return _.defaults(localExpects, globalExpects);

};