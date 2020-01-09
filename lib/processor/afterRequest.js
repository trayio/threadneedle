module.exports = async function (methodAfterRequest, globalAfterRequest, responseBody, params = {}, requestResponse) {

	//Start by executing globalAfterRequest if provided
	const returnedGlobalBody = (
		globalAfterRequest ?
		await globalAfterRequest(responseBody, params, requestResponse) :
		responseBody
	);

	const validatedGlobalBody = returnedGlobalBody || responseBody;

	//Then execute methodAfterRequest if provided
	const returnedMethodBody = (
		methodAfterRequest ?
		await methodAfterRequest(validatedGlobalBody, params, requestResponse) :
		validatedGlobalBody
	);

	return returnedMethodBody || validatedGlobalBody;

};

//Threadneedle v2 - breaking change
/*
	Threadneedle should not be dictating what is valid output from afterRequest
	function; that is up to the developer or libraries that use Threadneedle.
	Additionally, the current logic	means falsy values are also not allowed.
*/
// module.exports = async function (methodAfterRequest, globalAfterRequest, responseBody, params = {}, requestResponse) {
//
// 	//Start by executing globalAfterRequest if provided
// 	const returnedGlobalBody = (
// 		globalAfterRequest ?
// 		await globalAfterRequest(responseBody, params, requestResponse) :
// 		responseBody
// 	);
//
// 	//Then execute methodAfterRequest if provided
// 	return (
// 		methodAfterRequest ?
// 		await methodAfterRequest(returnedGlobalBody, params, requestResponse) :
// 		returnedGlobalBody
// 	);
//
// };
