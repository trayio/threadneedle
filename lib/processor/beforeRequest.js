/*
	Run the global `beforeRequest` method, and then the local method.

	This is used to make any final changes to the request object before it is
	executed by needle.
*/
const validateObjectArgumentByReference = require('./validateObjectArgumentByReference');

const referenceValidator = validateObjectArgumentByReference(
	'Modification by reference is deprecated. `beforeRequest` must return the modified object.',
	'`beforeRequest` must return an object.'
);

const paramsReferenceValidator = validateObjectArgumentByReference(
	'Modification of `params` by reference is not allowed in `beforeRequest`.',
	'`beforeRequest` should not modify `params`.'
);

module.exports = async function (methodBeforeRequest, globalBeforeRequest, request, params) {

	const returnedRequestValidator = referenceValidator(request);
	const paramsValidator = paramsReferenceValidator(params);

	//Start by executing globalBeforeRequest if provided and globals true
	const globalRequestResult = ( globalBeforeRequest ? await globalBeforeRequest(request, params) : request );

	paramsValidator();

	const validatedRequests = returnedRequestValidator(globalRequestResult) || request;

	const methodRequestResult = ( methodBeforeRequest ? await methodBeforeRequest(validatedRequests, params) : validatedRequests );

	paramsValidator();

	return returnedRequestValidator(methodRequestResult) || validatedRequests;

};
