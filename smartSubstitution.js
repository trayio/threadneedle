/*
	Top level alias for exposing substitute.js
	This enables a lib to simply do `require('@trayio/threadneedle/smartSubstitution')`
*/
const _ = require('lodash');

const substitute = require('./lib/addMethod/substitute.js');

module.exports = (target, params = {}) => {
	if (!_.isPlainObject(params)) {
		throw new Error('`params` must be an object');
	}
	return substitute(target, params);
};
