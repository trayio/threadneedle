/*
* Run the global `beforeRequest` method, and then the local method.
*/
const _ = require('lodash');
const when = require('when');

const localOnly = require('./localOnly');
const validateObjectArgumentByReference = require('./validateObjectArgumentByReference');

const referenceValidator = validateObjectArgumentByReference(
	'Modification by reference is deprecated. `beforeRequest` must return the modified object.',
	'`beforeRequest` must return an object'
);

module.exports = function (config, request = {}) {

	const { _globalOptions } = this;

	const validateResult = referenceValidator(request);

	//Start by executing globalBeforeRequest if provided and globals true
	const globalRequestExec = (
		_.isFunction(_globalOptions.beforeRequest) && !localOnly(config, 'beforeRequest') ?
		_globalOptions.beforeRequest(request) :
		request
	);

	return when(globalRequestExec)

	.then(validateResult)

	.then((globalRequestResult = request) => {
		return when(( config.beforeRequest ? config.beforeRequest(globalRequestResult) : globalRequestResult ));
	})

	.then(validateResult);

};
