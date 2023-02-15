var when               	= require('when');
var _                  	= require('lodash');

var { setParam, guid }	= require('../utils/mout');
var logger             	= require('../logger');
var globalize          	= require('./globalize');
var substitute         	= require('./substitute');

var validateInput      	= require('./validateSOAPInput');

var validateExpects    	= require('./validateExpects');
var validateNotExpects	= require('./validateNotExpects');

//The format of the response should always be an object with headers and body
var formatResponse = require('./formatResponse');

var getSOAPClient 		= require('./getSOAPClient');

var addMethodFunction	= require('./addMethodFunction');

module.exports = function (methodName, config, afterHeadersFunction) {
	var threadneedle = this;

	//If one-off REST mode, then perform addMethodREST instead
	if (_.isPlainObject(config) && (_.isString(config.type) && config.type.toLowerCase() === 'rest')) {
		config.globals = false;
		threadneedle[methodName] = require('./addMethodREST').call({ _globalOptions: { type: 'rest' } }, methodName, config);
		return;
	}

	validateInput.call(this, methodName, config);

	threadneedle[methodName] = function (params) {

		params = params || {};

		if (_.isFunction(config)) {
			logger.info(methodName+': Running method function.');
			return addMethodFunction(threadneedle, config, afterHeadersFunction, params);
		}


		//Do SOAP stuff
		return when.promise(function (resolve, reject) {

			//Handle afterHeader for resolving
			function afterHeadersResolve (body, result) {

				logger.info(methodName+': running `afterHeaders` hook');
				globalize.afterHeaders.call(threadneedle, config, null, body, params, result.response)

				.done(
					function (headers) {
						resolve(formatResponse(headers, body));
					},
					function (error) {
						reject(formatResponse({}, error));
					}
				);

			}

			//Handle afterHeader for rejecting
			function afterHeadersReject (error, payload, response) {

				logger.info(methodName+': running `afterHeaders` hook');
				globalize.afterHeaders.call(threadneedle, config, error, payload, params, response)

				.done(
					function (headers) {
						reject(formatResponse(headers, error));
					},
					function (err) {
						reject(formatResponse({}, err || error));
					}
				);

			}

			// Kick off that promise chain
			when()

			// Run a `before` if set on the params.
			.then(function () {
				logger.info('Running method `' + methodName + '` `before`.');
				return globalize.before.call(threadneedle, config, params);
			})

			// Set a bunch of local variables, formatted and templated
			.then(function (result) {

				params = result;

				logger.info(methodName+': substituting parameters');

				//Process all the required data prior to executing the actual request
				var fullMethodPath = globalize.string.call(threadneedle, config, params, 'method', 'baseMethod');

				var wsdl = globalize.string.call(threadneedle, config, params, 'wsdl');
				if (!wsdl || !_.isString(wsdl)) {	//Error if WSDL is not provided (as a string)
					return reject('`wsdl` field (string) must be provided to create a client instance.');
				}

				var options = globalize.object.call(threadneedle, 'options', config, params);

				var data = globalize.object.call(threadneedle, 'data', config, params);

				return {
					clientConfig: {
						wsdl: wsdl,
						options: options
					},
					method: fullMethodPath,
					data: data
				};

			})

			// Run the `beforeRequest`
			.then(function (soapRequest) {
				logger.info(methodName+': running `beforeSOAPRequest` hook');
				return globalize.beforeRequest.call(threadneedle, config, soapRequest, params);
			})

			// Run the actual soapRequest
			.then(function (soapRequest) {
				return when.promise(function (resolve, reject) {

					var handleResponse = function (err, result, raw, soapHeaders) {

						function handleReject (payload) {
							return reject({
								payload: payload,
								response: {
									raw: raw,
									headers: soapHeaders
								}
							});
						}

						if (err) {

							// Specifically handle socket hang ups nicely
							if (_.isError(err) && err.message === 'socket hang up') {
								return handleReject( {
									code: 'api_timeout',
									response:
									{},
									message: 'API call timeout. Looks like the API you\'re calling is having a wobble. Please try again later.'
								});
							} else {
								return handleReject(err);
							}

						} else {

							logger.info(methodName + ': got response', JSON.stringify(raw));

							var res = {
								body: result,
								response: {
									raw: raw,
									headers: soapHeaders
								}
							};


							var validationError;

							// Validate `expects`
							var expects = globalize.expects.call(threadneedle, config);
							validationError = validateExpects(res, expects);
							if (validationError) {
								return handleReject(validationError);
							}

							// Validate `notExpects`
							var notExpects = globalize.notExpects.call(threadneedle, config);
							validationError = validateNotExpects(res, notExpects);
							if (validationError) {
								return handleReject(validationError);
							}

							// We're valid!
							resolve(res);

						}

					};


					logger.info(methodName + ': creating SOAP client');

					//Create and retrieve an instance of the SOAP client
					getSOAPClient(soapRequest.clientConfig)

					//Validate if the desired method exists and retrieve it
					.then(function (client) {

						var methodExe = _.get(client, soapRequest.method, undefined);

						if (!methodExe) {
							throw new Error(soapRequest.method + ' method does not exist.');
						}

						return methodExe;
					})

					//Execute the request accordingly
					.done(
						function (methodExe) {
							logger.info(methodName + ': running SOAP soapRequest', soapRequest);
							methodExe(soapRequest.data, handleResponse);
						},
						function (err) {
							reject(err);
						}
					);

				});
			})

			// Handle the after success and failure messages
			.done(
				function (result) {

					logger.info(methodName + ': running `afterSuccess` hook');
					globalize.afterSuccess.call(threadneedle, config, result.body, params, result.response)
					.done(
						function (body) { afterHeadersResolve(body, result); },
						function (error) { afterHeadersReject(error, result.body, result.response); }
					);

				},
				function (err) {

					var payload = (err.payload ? err.payload : err),
						response = (err.response ? err.response : {});

					function rejectAfterHeaders (error) {
						afterHeadersReject(error, payload, response);
					}

					logger.info(methodName + ': running `afterFailure` hook', err);
					globalize.afterFailure.call(threadneedle, config, payload, params, response)
					.done(rejectAfterHeaders, rejectAfterHeaders);

				}
			);

		});

	};


	//Return here is necessary due how a one-off SOAP operation is implemnted: see addMethodREST
	return threadneedle[methodName];
};
