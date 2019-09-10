/*
* Given the config url and params, possibly prepend the global url
* in front of the config url.
*/
const startsWith = require('mout/string/startsWith');
const _ = require('lodash');

const substitute = require('../substitute');
const localOnly = require('./localOnly');

const URL_PROPERTY_ERROR_MESSAGE = '`url` in global configuration is deprecated. Use `baseUrl` instead.';

module.exports = function (config, params) {

	if (localOnly(config, 'baseUrl')) {
		return substitute(config.url, params);
	}

	if (this._globalOptions.url) {
		if (process.env.NODE_ENV === 'development') {
			throw new Error(URL_PROPERTY_ERROR_MESSAGE);
		} else {
			// eslint-disable-next-line no-console
			console.warn(URL_PROPERTY_ERROR_MESSAGE);
		}
	}

	//Ordering is significant - if globals true, global should run first
	const subbedGlobalUrl = substitute(this._globalOptions.baseUrl || this._globalOptions.url, params);
	const subbedUrl = substitute(config.url, params);

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
