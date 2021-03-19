const _ = require('lodash');

const identifySimpleMustache = require('./identifySimpleMustache');

module.exports = function (methodName, config) {

	// Ensure the minimum parameters have been passed
	if (!methodName || !_.isString(methodName)) {
		throw new Error(`The first parameter passed to 'addMethod' should be a string. Operation: ${ _.snakeCase(methodName)}`);
	}
	// If a function is inputted as the `config`, then just return - there's
	// really not much to validate.
	if (_.isFunction(config)) {
		return;
	}
	if (!config || !_.isObject(config)) {
		throw new Error(`The 'config' object should be an object. Operation: ${ _.snakeCase(methodName)}`);
	}

	// Check to see if the method has already been declared
	if (!_.isUndefined(this[methodName])) {
		throw new Error('Method `'+methodName+'` has already been declared.');
	}

	// Ensure the config parameters have been specified correctly
	if (!config.url && config.url !== '') {
		throw new Error(`The 'url' config parameter should be declared. Operation: ${ _.snakeCase(methodName)}`);
	}

	let method = config.method;

	if (_.isString(method)) {
		if (!identifySimpleMustache(method)) {
			method = method.toLowerCase();
			const allowedMethods = [ 'get', 'put', 'post', 'delete', 'head', 'patch', 'options' ];
			if (allowedMethods.indexOf(method) === -1) {
				throw new Error('The `method` "'+method+'" is not a valid method. Allowed methods are: '+allowedMethods.join(', '));
			}
		}
	} else if (!_.isFunction(method)) {
		throw new Error(`The 'method' parameter needs to be provided in the method configuration. Operation: ${ _.snakeCase(methodName)}`);
	}

};
