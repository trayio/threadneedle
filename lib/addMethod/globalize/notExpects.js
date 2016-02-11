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

	return _.defaults(localNotExpects, globalNotExpects);

};