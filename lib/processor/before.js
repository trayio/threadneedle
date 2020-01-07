/*
	Run the global `before` method, and then the local method.

	This is most often used to set/update properties in the `params`
	object. Any (heavy) preprocessing, especially asynchronous logic, should
	be done here.
*/
const validateObjectArgumentByReference = require('./validateObjectArgumentByReference');

const referenceValidator = validateObjectArgumentByReference(
	'Modification by reference is deprecated. `before` must return the modified object.',
	'`before` must return an object.'
);

module.exports = async function (methodBefore, globalBefore, params = {}) {

	const validateResult = referenceValidator(params);

	//Start by executing globalBefore if provided and globals true
	const globalParamsResult = ( globalBefore ? await globalBefore(params) : params );

	const validatedParams = validateResult(globalParamsResult) || params;

	const methodParamsResult = ( methodBefore ? await methodBefore(validatedParams) : validatedParams );

	return validateResult(methodParamsResult) || validatedParams;

};
