const _ = require('lodash');

const errorObject = {};

function add (statusCode, code, message) {
	errorObject[statusCode] = {
		code: _.snakeCase(code),
		message: message
	};
}

add(400, 'bad_request', 'Bad API request. Try checking your input properties.');
add(401, 'unauthorized', 'Unauthorized request. Have you added your API details correctly?');
add(402, 'payment_required', 'This code is reserved for future use.');
add(403, 'forbidden', 'Forbidden. Check you have the appropriate permissions to access this resource.');
add(404, 'not_found', 'Not found. Looks like this has been removed.');
add(405, 'Method Not Allowed', 'The method is not allowed. Please ensure all required headers are specified.');
add(406, 'Not Acceptable', 'The accept headers were not valid for the request. Please ensure all required details are provided.');
add(409, 'Conflict', 'The request could not be processed due to a conflict.');
add(410, 'Gone', 'Looks like this request is not available anymore. Please refer to the API provider and notify tray.io.');
add(411, 'Length Required', 'A valid Content-Length is required.');
add(412, 'Precondition Failed', 'The request headers provided did not satisfy the request precondition.');
add(413, 'Request Entity Too Large', 'The request is too large for the server to accept.');
add(415, 'Unsupported Media Type', 'The request format is not supported by the server.');
add(416, 'Requested Range Not Satisfiable', 'The server cannot supply the requested data.');
add(417, 'Expectation Failed', 'The server could not process the "Expects" field in the request header.');
add(418, 'I\'m a teapot (RFC 2324)', 'https://en.wikipedia.org/wiki/Teapot');
add(422, 'Unprocessable Entity (WebDAV)', 'The request was valid but could not be processed by the server. Please check the request data provided.');
add(423, 'Locked (WebDAV)', 'The resource that is being accessed is locked.');
add(424, 'Failed Dependency (WebDAV)', 'The request failed due to failure of a previous request.');
add(426, 'Upgrade Required', 'The upgrade field must be specified in the request header with a valid value.');
add(428, 'Precondition Required', 'The server requires the request to be conditional.');
add(429, 'too_many_requests', 'Too many requests have been made in the given timeframe.');
add(431, 'Request Header Fields Too Large', 'The request headers are too large for the server to accept.');
add(444, 'No Response (Nginx)', 'The server has not returned any data.');
add(449, 'Retry With', 'The server cannot accept the request due to missing data. Please ensure all required data has been provided.');
add(451, 'Unavailable For Legal Reasons', 'Looks like the API is unavailable due to legal reasons. Please check the service status of the API provider.');

add(500, 'Internal Server Error', 'Looks like the API is having issues. Please check the service status of the API provider.');
add(501, 'Not Implemented', 'Looks like this request is not possible. Please report to tray.io with the connector and the operation used.');
add(503, 'Service Unavailable', 'Looks like the API is currently unavailable. Please check the service status of the API provider.');
add(505, 'HTTP Version Not Supported', 'Looks like this request is not possible. Please report to tray.io with the connector and the operation used.');
add(506, 'Variant Also Negotiates (Experimental)', 'Looks like the API is having issues. Please check the service status of the API provider.');
add(507, 'Insufficient Storage (WebDAV)', 'The server was unable to store your request for processing. Please try again.');
add(508, 'Loop Detected (WebDAV)', 'Looks like the API is having issues. Please check the service status of the API provider.');
add(509, 'Bandwidth Limit Exceeded (Apache)', 'Looks like the API has reahed its request limit. Please check the service status of the API provider.');
add(510, 'Not Extended', 'Looks like this request is not possible. Please report to tray.io with the connector and the operation used.');
add(511, 'Network Authentication Required', 'The network requires valid credentials before processing your request.');


module.exports = errorObject;
