/*
* Given the config url and params, possibly prepend the global url
* in front of the config url.
*/
var startsWith = require('mout/string/startsWith');
var _          = require('lodash');
var substitute = require('../substitute');


module.exports = function (config, params) {

  var subbedGlobalUrl = substitute(this._globalOptions.baseUrl || this._globalOptions.url, params);
  var subbedUrl       = substitute(config.url, params);

  var localOnly = config.globals === false || _.get(config, 'globals.baseUrl', true) === false;

  // Add the URL
  if (_.isString(subbedGlobalUrl) &&
      !startsWith(subbedUrl, 'http://') &&
      !startsWith(subbedUrl, 'https://') &&
      !localOnly) {
    return subbedGlobalUrl + subbedUrl;
  }

  else {
    return subbedUrl;
  }

};
