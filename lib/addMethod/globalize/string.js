/*
    Given the keys for both local and global field, return the substituted
    string with global prepending the local string
*/
var startsWith = require('mout/string/startsWith');
var _          = require('lodash');
var substitute = require('../substitute');


module.exports = function (config, params, key, globalKey) {

    globalKey = globalKey || key;

    var subbedGlobalString  = substitute(this._globalOptions[globalKey], params) || '',
        subbedMethodString  = substitute(config[key], params) || '';

    // Return the full string
    return (
        _.isString(subbedGlobalString) && !require('./localOnly')(config, globalKey)   ?
        subbedGlobalString + subbedMethodString :
        subbedMethodString
    );

};
