var _ = require('lodash');
var when = require('when');
var logger = require('../logger');

var globalize = require('./globalize');

//The format of the response should always be an object with headers and body
function formatResponse (headers, body) {
	return {
		headers: ( _.isPlainObject(headers) ? headers : {} ),
		body: body
	};
}

module.exports = function (threadneedle, config, afterHeadersFunction, params) {

	var afterHeadersConfig = {};
	if (_.isFunction(afterHeadersFunction)) {
		afterHeadersConfig.afterHeaders = afterHeadersFunction;
	} else {
		if (!_.isUndefined(afterHeadersFunction)) {
			return when.reject(new Error('afterHeaders must be a function.'));
		}
	}

	return when.promise(function(resolve, reject) {
		when(config.call(threadneedle, params))
		.done(
			function(body) {

				globalize.afterHeaders.call(threadneedle, afterHeadersConfig, null, body, params, null)

				.done(
					function(headers) {
						resolve(formatResponse(headers, body));
					},
					function(afterHeadersError) {
						reject(formatResponse({}, afterHeadersError));
					}
				);

			},
			function(functionError) {

				globalize.afterHeaders.call(threadneedle, afterHeadersConfig, functionError, null, params, null)

				.done(
					function(headers) {
						reject(formatResponse(headers, functionError));
					},
					function(afterHeadersError) {
						reject(formatResponse({}, afterHeadersError || functionError));
					}
				);

			}
		);
	});

};