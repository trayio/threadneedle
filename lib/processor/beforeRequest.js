/*
	Run the global `beforeRequest` method, and then the local method.
*/
const _ = require('lodash');

const validateObjectArgumentByReference = require('./validateObjectArgumentByReference');

const referenceValidator = validateObjectArgumentByReference(
	'Modification by reference is deprecated. `beforeRequest` must return the modified object.',
	'`beforeRequest` must return an object.'
);

module.exports = function (methodBeforeRequest, globalBeforeRequest, request, params) {

	const { _globalOptions } = this;

	const validateResult = referenceValidator(request);

	//Start by executing globalBeforeRequest if provided and globals true
	const globalRequestExec = ( globalBeforeRequest ? globalBeforeRequest(request, params) : request );

	return Promise.resolve(globalRequestExec)

	.then(validateResult)

	.then(async (globalRequestResult = request) => {
		return ( methodBeforeRequest ? methodBeforeRequest(globalRequestResult, params) : globalRequestResult );
	})

	.then(validateResult);

};

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
