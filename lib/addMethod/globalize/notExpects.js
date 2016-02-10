/*
* Given a fully normalized `notExpects` object from both the global
* and the local method, return the final `notExpects` object to be used
* in the validation.
*/
var _ 							 = require('lodash');
var normalizeExpects = require('../normalizeExpects');


module.exports = function (notExpects) {

	var globalNotExpects = normalizeExpects(this._globalOptions.notExpects || {});
	var localNotExpects  = normalizeExpects(notExpects || {});

	return _.defaults(localNotExpects, globalNotExpects);

};