const _ = require('lodash');
const when = require('when');
const logger = require('../logger');

const globalize = require('./globalize');

//The format of the response should always be an object with headers and body
const formatResponse = require('./formatResponse');

module.exports = function (threadneedle, config, afterHeadersFunction, params) {

	const afterHeadersConfig = {};
	if (_.isFunction(afterHeadersFunction)) {
		afterHeadersConfig.afterHeaders = afterHeadersFunction;
	} else {
		if (!_.isUndefined(afterHeadersFunction)) {
			return when.reject(new Error('afterHeaders must be a function.'));
		}
	}

	return when.promise((resolve, reject) => {
		new Promise((resolve, reject) => {
			try {
				resolve(config.call(threadneedle, params));
			} catch (functionCallError) {
				reject(functionCallError);
			}
		})
		.then((body) => {
			globalize.afterHeaders.call(threadneedle, afterHeadersConfig, null, body, params, null)

			.then((headers) => {
				resolve(formatResponse(headers, body));
			})
			.catch((afterHeadersError) => {
				reject(formatResponse({}, afterHeadersError));
			});
		})
		.catch((functionError) => {
			globalize.afterHeaders.call(threadneedle, afterHeadersConfig, functionError, null, params, null)

			.then((headers) => {
				reject(formatResponse(headers, functionError));
			})
			.catch((afterHeadersError) => {
				reject(formatResponse({}, afterHeadersError || functionError));
			});
		});
	});

};
