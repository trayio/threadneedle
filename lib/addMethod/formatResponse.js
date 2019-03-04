var _              		= require('lodash');

//The format of the response should always be an object with headers and body
module.exports = function (headers, body) {
	return {
		headers: ( _.isPlainObject(headers) ? headers : ( logger.warning('headers must be an object'), {} ) ),
		body: body
	};
};
