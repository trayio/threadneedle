/*
* Given the config url and params, possibly prepend the global url
* in front of the config url.
*/
const startsWith = require('mout/string/startsWith');
const _ = require('lodash');

const substitute = require('../substitute');
const localOnly = require('./localOnly');

const URL_PROPERTY_ERROR_MESSAGE = '`url` in global configuration is deprecated. Use `baseUrl` instead.';

function processUrl (config, params) {

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
	const subbedUrl = (
		config.url === '' ?
		config.url :
		substitute(config.url, params)
	);

	// Add the URL
	return (
		_.isString(subbedGlobalUrl) &&
		!startsWith(subbedUrl, 'http://') &&
		!startsWith(subbedUrl, 'https://') ?
		subbedGlobalUrl + subbedUrl :
		subbedUrl
	);

}

module.exports = function (config, params) {
	const processedUrl = processUrl.call(this, config, params);
	if (_.isString(processedUrl) && processedUrl !== '') {
		return processedUrl;
	} else {
		throw new Error('A valid URL has not been supplied.');
	}
};
