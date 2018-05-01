/*
 * Run the global and local `afterHeaders` method.
 */
var when = require('when');
var _ = require('lodash');


module.exports = function (config, error, body, params, res) {
	var threadneedle = this;
	return when.promise(function (resolve, reject) {

		when()

		// Run global promise first
		.then(function () {
			if (_.isFunction(threadneedle._globalOptions.afterHeaders) && !require('./localOnly')(config, 'afterHeaders')) {
				return when(threadneedle._globalOptions.afterHeaders(error, params, body, res));
			}
		})

		// Then run the local prmoise
		.then(function (result) {

			// if result returned, set headers as that. If not,
			// set as blank object
			result = ( _.isUndefined(result) ? {} : result );

			if (_.isFunction(config.afterHeaders)) {
				return _.defaultsDeep(
					when(config.afterHeaders(error, params, body, res)),
					result
				);
			}

			return result;

		})

		.then(function (result) {
			// if result returned, set body as that. If not,
			// set as blank object
			return ( _.isUndefined(result) ? {} : result );
		})

		.done(resolve, reject);

	});
};
