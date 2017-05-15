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

    //For "data" key, if the subbedObject is a string, return that only 
    var localString = ( key === 'data' && _.isString(subbedObject) ? true : false );

    if (require('./localOnly')(config, key) || localString) {
        return subbedObject;
    } else {
        return _.defaultsDeep(subbedObject, subbedGlobalObject);
    }

};
