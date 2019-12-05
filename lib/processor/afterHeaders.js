const _ = require('lodash');

function returnResponseHeaders () { return {}; }

module.exports = async function (methodAfterHeaders = returnResponseHeaders, globalAfterHeaders = returnResponseHeaders, error = null, responseBody, params = {}, requestResponse) {

	//Execute globalAfterHeaders and store result
	let headers = await globalAfterHeaders(error, responseBody, params, requestResponse) || {};

	//Execute and default to methodAfterHeaders result
	headers = _.defaultsDeep(
		await methodAfterHeaders(error, responseBody, params, requestResponse),
		headers
	);

	return headers || {};

};
