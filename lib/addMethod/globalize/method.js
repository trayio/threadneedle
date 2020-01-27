const substitute = require('../substitute');

module.exports = function (config, params) {

	const method = substitute(config.method, params).toLowerCase();

	switch (method) {
		case 'head':
		case 'options':
		case 'get':
		case 'post':
		case 'put':
		case 'patch':
		case 'delete':
			return method;
		default:
			throw new Error(`Invalid method: ${method}\n'method' must be a valid HTTP verb.`);
	}

};
