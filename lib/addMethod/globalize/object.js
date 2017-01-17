/*
* Given an object and some parameters, set up the full object, populated
* with global parameters. Uses `_.defaultsDeep`
*/
var startsWith = require('mout/string/startsWith');
var _          = require('lodash');
var substitute = require('../substitute');


module.exports = function (key, config, params) {

    params = params || {};

    var subbedGlobalObject = substitute(this._globalOptions[key], params);
    var subbedObject       = substitute(config[key] || {}, params);

    if (config.globals === false)
        return subbedObject;
    else
        return _.defaultsDeep(subbedObject, subbedGlobalObject);

};
