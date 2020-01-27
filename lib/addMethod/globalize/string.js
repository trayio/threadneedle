/*
    Given the keys for both local and global field, return the substituted
    string with global prepending the local string
*/
const _ = require('lodash');

const substitute = require('../substitute');
const localOnly = require('./localOnly');

module.exports = function (config, params, key, globalKey) {

	globalKey = globalKey || key;

	if (localOnly(config, globalKey)) {
		return substitute(config[key], params) || '';
	}

	//Ordering is significant - if globals true, global should run first
	const subbedGlobalString = substitute(this._globalOptions[globalKey], params) || '',
		subbedMethodString = substitute(config[key], params) || '';

	// Return the full string
	return (
        _.isString(subbedGlobalString) ?
        subbedGlobalString + subbedMethodString :
        subbedMethodString
	);

};
