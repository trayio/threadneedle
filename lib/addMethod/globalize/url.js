/*
* Given the config object passed to a method, use the global settings
* to update the config accordingly.
*/ 
var startsWith = require('mout/string/startsWith');
var _          = require('lodash');
var substitute = require('../substitute');


module.exports = function (url, params) {

  var subbedGlobalUrl = substitute(this._globalOptions.url, params);
  var subbedUrl       = substitute(url, params);

  // Add the URL
  if (_.isString(subbedGlobalUrl) && 
      !startsWith(subbedUrl, 'http://') && 
      !startsWith(subbedUrl, 'https://')) {
    return subbedGlobalUrl + subbedUrl;
  }

  else {
    return subbedUrl;
  }

};