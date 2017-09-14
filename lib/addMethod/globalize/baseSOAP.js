/*
* Given the config url and params, possibly prepend the global url
* in front of the config url.
*/
var startsWith = require('mout/string/startsWith');
var _          = require('lodash');
var substitute = require('../substitute');


module.exports = function (config, params) {

    var subbedSOAPBaseMethod  = substitute(this._globalOptions.baseMethod || this._globalOptions.method, params);
    var subbedMethod          = substitute(config.url, params);

    // Return the full Method path
    return (
        _.isString(subbedSOAPBaseMethod) && !require('./localOnly')(config, 'baseMethod')   ?
        subbedSOAPBaseMethod + subbedMethod :
        subbedMethod
    );

};
