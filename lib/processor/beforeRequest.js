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

module.exports = async function (methodBeforeRequest, globalBeforeRequest, request, params) {

	const returnedRequestValidator = referenceValidator(request);

	//Start by executing globalBeforeRequest if provided and globals true
	const globalRequestResult = ( globalBeforeRequest ? await globalBeforeRequest(request, params) : request );

	const validatedRequests = returnedRequestValidator(globalRequestResult) || request;

	const methodRequestResult = ( methodBeforeRequest ? await methodBeforeRequest(validatedRequests, params) : validatedRequests );

	return returnedRequestValidator(methodRequestResult) || validatedRequests;

};
