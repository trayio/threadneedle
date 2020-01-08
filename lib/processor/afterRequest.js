function returnResponseBody (responseBody) { return responseBody; }

module.exports = async function (methodAfterRequest = returnResponseBody, globalAfterRequest = returnResponseBody, responseBody, params = {}, requestResponse) {

	//Start by executing globalAfterRequest if provided
	let globallyFormattedResponse = await globalAfterRequest(responseBody, params, requestResponse);

	globallyFormattedResponse = globallyFormattedResponse || responseBody;

	//Then execute methodAfterRequest if provided
	return await methodAfterRequest(globallyFormattedResponse, params, requestResponse) || responseBody;

};
