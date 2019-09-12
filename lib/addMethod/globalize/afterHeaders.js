/*
* Run the global and local `afterHeaders` method.
*/

const _ = require('lodash');
const when = require('when');

const localOnly = require('./localOnly');

const AFTER_HEADERS_RETURN_ERROR = '`afterHeaders` must return an object.';
function validateResult (returnedHeaders) {
	if (_.isUndefined(returnedHeaders) || _.isPlainObject(returnedHeaders)) {
		return returnedHeaders;
	}
	if (process.env.NODE_ENV === 'development') {
		throw new Error(AFTER_HEADERS_RETURN_ERROR);
	} else {
		// eslint-disable-next-line no-console
		console.warn(AFTER_HEADERS_RETURN_ERROR);
	}
}

module.exports = function (config, error, body, params, res) {

	const { _globalOptions } = this;

	//Start by executing globalAfterHeadersExec if provided and globals true
	const globalAfterHeadersExec = (
		_.isFunction(_globalOptions.afterHeaders) && !localOnly(config, 'afterHeaders') ?
		_globalOptions.afterHeaders(error, params, body, res) :
		{}
	);

	return when(globalAfterHeadersExec)

	.then(validateResult)

	.then((globalAfterHeadersResult = {}) => {
		return when((
			config.afterHeaders ?
			config.afterHeaders(error, params, body, res) :
			globalAfterHeadersResult
		))
		.then(validateResult)
		.then((methodAfterHeadersResult = {}) => {
			return _.defaultsDeep(
				methodAfterHeadersResult,
				globalAfterHeadersResult
			);
		});
	});

};
