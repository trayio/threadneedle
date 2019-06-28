/*
* Given the config url and params, possibly prepend the global url
* in front of the config url.
*/
var startsWith = require('mout/string/startsWith');
var _          = require('lodash');

var substitute = require('../substitute');
var localOnly = require('./localOnly');

module.exports = function(config, params) {

    if (localOnly(config, 'baseUrl')) {
        return substitute(config.url, params);
    }

    //Ordering is significant - if globals true, global should run first
	var subbedGlobalUrl = substitute(this._globalOptions.baseUrl || this._globalOptions.url, params);
	var subbedUrl = substitute(config.url, params);

	// Add the URL
	if (_.isString(subbedGlobalUrl) &&
		!startsWith(subbedUrl, 'http://') &&
		!startsWith(subbedUrl, 'https://')
	) {
		return subbedGlobalUrl + subbedUrl;
	} else {
		return subbedUrl;
	}

};
