var when           		= require('when');
var needle         		= require('@trayio/needle');
var _              		= require('lodash');

var { setParam, guid }	= require('../utils/mout');
var logger         		= require('../logger');
var globalize      	    = require('./globalize');
var validateInput      	= require('./validateRESTInput');

var validateExpects    	= require('./validateExpects');
var validateNotExpects	= require('./validateNotExpects');

//The format of the response should always be an object with headers and body
var formatResponse = require('./formatResponse');

var addMethodFunction	= require('./addMethodFunction');

module.exports = function (methodName, config, afterHeadersFunction) {
	var threadneedle = this;

	//If one-off SOAP mode, then perform addMethodSOAP instead
	if (_.isPlainObject(config) && ((_.isString(config.type) && config.type.toLowerCase() === 'soap') || config.soap)) {
		if (config.soap) {
			//eslint-disable-next-line no-console
			console.warn(methodName + ': `soap` flag has been deprecated. Use `type: \'SOAP\'` instead.');
		}
		config.globals = false;
		threadneedle[methodName] = require('./addMethodSOAP').call({ _globalOptions: { type: 'soap' } }, methodName, config);
		return;
	}

	// TCP keep-alive shorter than 350 sec to prevent AWS NAT idle timeout: https://repost.aws/knowledge-center/lambda-vpc-timeout
	const keepAliveAgent = new require('http').Agent({ keepAlive: true, keepAliveMsecs: 10000 });

	// All methods should default to no timeout, maximising the chance
	// of success.
	needle.defaults({
		open_timeout: 0,
		read_timeout: 0,
		agent: keepAliveAgent
	});

	// Validate the input. Errors will be `throw`n if there's anything
	// wrong. Throwing is usually bad - but this is declarative, so will happen
	// on app startup;
	validateInput.call(this, methodName, config);

	// Create the method
	threadneedle[methodName] = function (params) {

		params = params || {};

		/*
	  Override - if a function is provided as config, then simply run it - don't run HTTP requests.
	  It should expect a promise returned by the function. Pass the context
	*/
		if (_.isFunction(config)) {
			logger.info(methodName+': Running method function.');
			return addMethodFunction(threadneedle, config, afterHeadersFunction, params);
		}


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
				logger.info('Running method `'+methodName+'` `before`.');
				return globalize.before.call(threadneedle, config, params);
			})

			// Set a bunch of local variables, formatted and templated
			.then(function (result) {
				params = result;

				logger.info(methodName+': substituting parameters');

				// Method, always lowercased
				var method = globalize.method.call(threadneedle, config, params);

				// Add a temp file parameter for file handling operations
				if (config.fileHandler === true) {
					params.temp_file = '/tmp/'+guid();
				}

				// The URL endpoint. Query parameters allowed from here.
				var url = globalize.baseUrl.call(threadneedle, config, params);
				// var url = globalize.call(threadneedle, config.globals, 'url', config, params);

				// Add query parameters intelligently, without conflicting from query parameters
				// already specified in the URL.
				var query = globalize.object.call(threadneedle, 'query', config, params);
				_.each(query, function (value, key) {
					if (_.isArray(value) && value.length > 0) {
						value = value.join(',');
					}
					if (!_.isUndefined(value) && !(_.isString(value) && value === '')) {
						url = setParam(url, key, value);
					}
				});

				// The request options, substituted
				var options = globalize.object.call(threadneedle, 'options', config, params);

				// Post/put/delete data
				var data;
				switch (method) {
					case 'get':
					case 'head':
						break;
					default:
						data = globalize.object.call(threadneedle, 'data', config, params);
				}

				return {
					url: url,
					data: data,
					options: options,
					method: method
				};
			})

			// Run the `beforeRequest`
			.then(function (request) {
				logger.info(methodName+': running `beforeRequest` hook');
				return globalize.beforeRequest.call(threadneedle, config, request, params);
			})

			// Run the actual request
			.then(function (request) {
				return when.promise(function (resolve, reject) {

					var handleResponse = function (err, res, body) {

						function handleReject (payload) {
							return reject({
								payload: payload,
								response: res
							});
						}

						if (err) {

							// Specifically handle socket hang ups nicely
							if (_.isError(err) && err.message === 'socket hang up') {
								return handleReject( {
									code: 'api_timeout',
									response: {},
									message: 'API call timeout. Looks like the API you\'re calling is having a wobble. Please try again later.'
								});
							} else {
								return handleReject(err);
							}

						} else {

							logger.info(methodName + ': got response', res.statusCode, JSON.stringify(body));

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
							resolve({
								body: body,
								response: res
							});

						}
					};

					var method = request.method;

					// console.log(options);
					logger.info(methodName + ': running ' + method + ' request', request);

					// Run a different method for get to not include data
					switch (method) {
						case 'get':
						case 'head':
							needle[method](request.url, request.options, handleResponse);
							break;
						case 'options':
							needle.request('options', request.url, request.options, handleResponse);
							break;
						default:
							needle[method](request.url, request.data, request.options, handleResponse);
					}

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

	//Return here is necessary due how a one-off REST operation is implemnted: see addMethodSOAP
	return threadneedle[methodName];
};
