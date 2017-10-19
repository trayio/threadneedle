/*
* Given the config url and params, possibly prepend the global url
* in front of the config url.
*/
var startsWith = require('mout/string/startsWith');
var _          = require('lodash');
var substitute = require('../substitute');


module.exports = function (config, params, key, globalKey) {

    globalKey = globalKey || key;

    var subbedGlobalString  = substitute(this._globalOptions[globalKey], params) || '',
        subbedMethodString  = substitute(config[key], params) || '';

    // Return the full Method path
    return (
        _.isString(subbedGlobalString) && !require('./localOnly')(config, globalKey)   ?
        subbedGlobalString + subbedMethodString :
        subbedMethodString
    );

};
