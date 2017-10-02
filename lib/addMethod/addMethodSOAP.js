var when               = require('when');
var _                  = require('lodash');
var setParam           = require('mout/queryString/setParam');
var guid               = require('mout/random/guid');
var logger             = require('../logger');
var globalize          = require('./globalize');
var substitute         = require('./substitute');

// var validateInput      = require('../validateInput');

var validateExpects    = require('./validateExpects');
var validateNotExpects = require('./validateNotExpects');


module.exports = function (methodName, config) {

	var threadneedle = this;

	threadneedle[methodName] = function (params) {

		params = params || {};

		if (_.isFunction(config)) {
	      logger.info(methodName+': Running method function.');
	      return when(config.call(threadneedle, params));
	    }

		logger.info('Running method `'+methodName+'` `before`.');

		//Get the full SOAP Method
		var fullMethodPath = globalize.baseSOAP.call(threadneedle, config, params);

		//Get/set the client
		var clientPromise = when.promise(function (resolve, reject) {


			if (!_.isUndefined(config.globals) && config.globals === false) {

				require('./getSOAPClient')(config)

				.done(
					function (newClient) {
						threadneedle._setClient(newClient);
						resolve(newClient);
					},
					function (err) {
						console.log('Err setting client');
						console.log(err);
						reject(err);
					}
				);


			} else {

				var client = threadneedle._getClient();

				if (!client) {

					require('./getSOAPClient')(threadneedle._globalOptions)

					.done(
						function (newClient) {
							threadneedle._setClient(newClient);
							resolve(newClient);
						},
						function (err) {
							console.log('Err setting client');
							console.log(err);
							reject(err);
						}
					);


				} else {
					resolve(client);
				}

			}

		});

		return when.promise(function (exeResolve, exeReject) {

			when(clientPromise)

			.then(function (client) {

				if (!_.has(client, fullMethodPath)) {
					throw new Error(fullMethodPath + ' method does not exist.');
				}

				var methodExe = _.get(client, fullMethodPath);

				//Do SOAP stuff
				return when.promise(function (resolve, reject) {

					// Kick off that promise chain
					when(clientPromise)

					// Run a `before` if set on the params.
					.then(function () {
						return globalize.before.call(threadneedle, config, params);
					})

					// Set a bunch of local variables, formatted and templated
					.then(function (result) {

						params = result;

						logger.info(methodName+': substituting parameters');


						// The request options, substituted
						var options = globalize.object.call(threadneedle, 'options', config, params);

						// Post/put/delete data
						var data = globalize.object.call(threadneedle, 'data', config, params);

						return {
							data: data,
							options: options
						};

					})

					// Run the `beforeRequest`
					.then(function (request) {
						logger.info(methodName+': running `beforeSOAPRequest` hook');
						return globalize.beforeRequest.call(threadneedle, config, request, params);
					})

					// Run the actual request
					.then(function (request) {
						return when.promise(function(resolve, reject) {
							//TODO
							// var handleResponse = function(err, res, body) {
							var handleResponse = function(err, result, raw, soapHeaders) {

								function handleReject(payload) {
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
									}

									else {
										return handleReject(err);
									}

								} else {

									console.log('handleResponse', result);

									// logger.info(methodName + ': got response', res.statusCode, JSON.stringify(body));

									// var validationError;
									//
									// // Validate `expects`
									// var expects = globalize.expects.call(threadneedle, config);
									// validationError = validateExpects(res, expects);
									// if (validationError){
									// 	return handleReject(validationError);
									// }
									//
									// // Validate `notExpects`
									// var notExpects = globalize.notExpects.call(threadneedle, config);
									// validationError = validateNotExpects(res, notExpects);
									// if (validationError){
									// 	return handleReject(validationError);
									// }

									// We're valid!
									resolve({
										body: result,
										response: {
											raw: raw,
											headers: soapHeaders
										}
									});

								}

							};


							logger.info(methodName + ': running SOAP request', request);
							methodExe(request.data, handleResponse);

						});
					})

					// Handle the after success and failure messages
					.done(
						function (result) {
							logger.info(methodName+': running `afterSuccess` hook');
							globalize.afterSuccess.call(threadneedle, config, result.body, params, result.response).done(resolve, reject);
						}, function (err) {
							logger.info(methodName+': running `afterFailure` hook', err);
							var payload = ( err.payload ? err.payload : err ),
							response = ( err.response ? err.response : {} );
							globalize.afterFailure.call(threadneedle, config, payload, params, response).done(reject, reject);
						}
					);



				});

			})

			.done(exeResolve, exeReject);

		});


	};

};
