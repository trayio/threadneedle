/*
	Run the global `before` method, and then the local method.

	Note that this is most often used to set/update parameters in the `params`
	object - need to ensure that variables are passed and saved correctly in the
	tests pre substitution.
*/
const _ = require('lodash');

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

	return validateResult(methodParamsResult) || params;

};

// module.exports = async function (methodBefore, globalBefore, params = {}) {
//
// 	const { _globalOptions } = this;
//
// 	const validateResult = referenceValidator(params);
//
// 	//Start by executing globalBefore if provided and globals true
// 	const globalBeforeExec = ( globalBefore ? globalBefore(params) : params );
//
// 	return Promise.resolve(globalBeforeExec)
//
// 	.then(validateResult)
//
// 	.then((globalParamsResult = params) => {
// 		return ( methodBefore ? methodBefore(globalParamsResult) : globalParamsResult );
// 	})
//
// 	.then(validateResult);
//
// };

//Threadneedle v2
/*
module.exports = async function (methodBefore, globalBefore, params = {}) {

	//Start by executing globalBefore if provided
	const globalParamsResult = ( globalBefore ? await globalBefore(params) : params );

	//Then execute methodBefore if provided
	return ( methodBefore ? await methodBefore(globalParamsResult) : globalParamsResult );

};
*/
