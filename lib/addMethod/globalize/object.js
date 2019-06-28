/*
* Given an object and some parameters, set up the full object, populated
* with global parameters. Uses `_.defaultsDeep`
*/
var _          = require('lodash');

var substitute = require('../substitute');
var localOnly = require('./localOnly');

module.exports = function (key, config, params) {

    params = params || {};

    if (localOnly(config, key)) {
        return substitute(config[key] || {}, params);
    }

    //Ordering is significant - if globals true, global should run first
    var subbedGlobalObject = substitute(this._globalOptions[key], params);
    var subbedObject = substitute(config[key] || {}, params);

    //For "data" key, if the subbedObject is a string, return that only
    var localString = ( key === 'data' && _.isString(subbedObject) );

    return (
        localString ?
        subbedObject :
        _.defaultsDeep(subbedObject, subbedGlobalObject)
    );

};
