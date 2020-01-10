const _ = require('lodash');

module.exports = function (methodName, config) {

	// Ensure the minimum parameters have been passed
	if (!methodName || !_.isString(methodName)) {
		throw new Error('The first parameter passed to `addMethod` should be a string.');
	}
	// If a function is inputted as the `config`, then just return - there's
	// really not much to validate.
	if (_.isFunction(config)) {
		return;
	}
	if (!config || !_.isObject(config)) {
		throw new Error('The `config` object should be an object.');
	}

	// Check to see if the method has already been declared
	if (!_.isUndefined(this[methodName])) {
		throw new Error('Method `'+methodName+'` has already been declared.');
	}

	// Ensure the config parameters have been specified correctly
	if (!config.url && config.url !== '') {
		throw new Error('The `url` config parameter should be declared.');
	}
	if (!config.method || !_.isString(config.method)) {
		throw new Error('The `method` config parameter should be declared as string.');
	}
	const method = config.method.toLowerCase();
	const allowedMethods = [ 'get', 'put', 'post', 'delete', 'head', 'patch' ];
	if (allowedMethods.indexOf(method) === -1) {
		throw new Error('The `method` "'+method+'" is not a valid method. Allowed methods are: '+allowedMethods.join(', '));
	}

};
