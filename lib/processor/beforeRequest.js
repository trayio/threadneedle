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

	// return Promise.resolve(globalRequestExec)
	//
	// .then(returnedRequestValidator)
	//
	// .then(async (globalRequestResult = request) => {
	// 	return ( methodBeforeRequest ? methodBeforeRequest(globalRequestResult, params) : globalRequestResult );
	// })
	//
	// .then(returnedRequestValidator);

};

// module.exports = function (methodBeforeRequest, globalBeforeRequest, request, params) {
//
// 	const validateResult = referenceValidator(request);
//
// 	//Start by executing globalBeforeRequest if provided and globals true
// 	const globalRequestExec = ( globalBeforeRequest ? globalBeforeRequest(request, params) : request );
//
// 	return Promise.resolve(globalRequestExec)
//
// 	.then(validateResult)
//
// 	.then(async (globalRequestResult = request) => {
// 		return ( methodBeforeRequest ? methodBeforeRequest(globalRequestResult, params) : globalRequestResult );
// 	})
//
// 	.then(validateResult);
//
// };

//Threadneedle v2
// module.exports = async function (methodBeforeRequest, globalBeforeRequest, formattedRequest, params = {}) {
// 	/*	NOTE: params modification is not guaranteed to be passed from global to method,
// 		and therefore should be avoided */
//
// 	//Start by executing globalBeforeRequest if provided
// 	let requestObject = ( globalBeforeRequest ? await globalBeforeRequest(formattedRequest, params) : formattedRequest );
//
// 	requestObject = requestObject || formattedRequest;
//
// 	//Then execute methodBeforeRequest if provided
// 	requestObject = ( methodBeforeRequest ? await methodBeforeRequest(requestObject, params) : requestObject );
//
// 	return requestObject || formattedRequest;
//
// };
