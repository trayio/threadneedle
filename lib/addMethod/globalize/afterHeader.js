/*
 * Run the global and local `afterHeader` method.
 */
var when = require('when');
var _ = require('lodash');


module.exports = function (config, body, params, res) {
	var threadneedle = this;
	return when.promise(function (resolve, reject) {

        var headers = {};

		when()

		// Run global promise first
		.then(function () {
			if (_.isFunction(threadneedle._globalOptions.afterHeader) && !require('./localOnly')(config, 'afterHeader')) {
				return when(threadneedle._globalOptions.afterHeader(headers, params, body, res));
			}
		})

		// Then run the local prmoise
		.then(function (result) {

			// if result returned, set headers as that. If not,
			// assume that the `headers` has been manipulated
			if (result) {
				headers = result;
			}


			if (_.isFunction(config.afterHeader)) {
				return when(config.afterHeader(headers, params, body, res));
			}
		})

		.then(function (result) {

			// if result returned, set body as that. If not,
			// assume that the `body` has been manipulated
			if (result) {
				headers = result;
			}


			return headers;
		})

		.done(resolve, reject);

	});
};
