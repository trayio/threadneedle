const _ = require('lodash');

const logger = require('./utils/logger');
const processor = require('./processor');


//TODO - unfinished
module.exports = function (methodName, methodConfig, requestFormatter, requestExecutor) {

	const threadneedle = this;


	function logRun (message) {
		logger.info(`${methodName} ${message}.\n`);
	}
	function logWarn (message) {
		logger.warning(`${methodName} ${message}.`);
	}

	validateCoreConfig(methodConfig);

	/*	Perform some preprocessing if the method is not an object,
		such that these do not need to be evaluated during method's runtime/execution */
	//Get the globalConfig relative to this method
	const relativeGlobalConfig = getRelativeGlobalConfig(methodConfig, threadneedle.globalConfig);

	//Generate the expectsValidator and notExpectsValidator
	// const { expectsValidator, notExpectsValidator } = (
	// 	relativeGlobalConfig ?
	// 	{
	// 		expectsValidator: processor.expects(false, methodConfig.expects, relativeGlobalConfig.expects),
	// 		notExpectsValidator: processor.expects(true, methodConfig.notExpects, relativeGlobalConfig.notExpects)
	// 	} :
	// 	{}
	// );

	/*	Most of the processor functions follow a similar pattern in the regards to
		the function call and parameters passed in. This is automated here. */
	const flowExecutionFunction = (processorFunc, propertyFunc, ...additionalParams) => {
		logRun(`\`${propertyFunc}\` is being processed`);
		return processor[processorFunc](
			methodConfig[propertyFunc],
			relativeGlobalConfig[propertyFunc],
			...additionalParams
		);
	};

	async function generateAndExecuteRequest (params = {}) {

		//Start the execution flow
		logRun('method request has begun execution');

		//First process the `before`
		//logRun('`before` is being processed');
		const beforeResult = await flowExecutionFunction('before', 'before', params);

		//Then process model type specific logic (REST vs SOAP vs GraphQL)
		const formattedRequest = await requestFormatter(methodConfig, flowExecutionFunction, params, beforeResult);

		const originalParams = _.cloneDeep(params);

		//logRun('`beforeRequest` is being processed');
		const requestLoad = await flowExecutionFunction('beforeRequest', 'beforeRequest', formattedRequest, params)
		.finally(() => {
			//Validate params has not been modified
			if (!_.isEqual(originalParams, params)) {
				logWarn('avoid modifying params in `beforeRequest`');
			}
		});

		/*	requestExecutor must return an object on success (and preferablely
			also on failure, but can also be error instance):
			success - { body, response }
			failure - { payload, response }	*/
		return requestExecutor(requestLoad, expectsValidator, notExpectsValidator);

	}

	return function (params) {

		/*	afterHeaders must run after everything,
			and then format response before return	*/
		function finalize (error, body, response) {
			return flowExecutionFunction('afterHeaders', 'afterHeaders', error, body, params, response)
			.then(
				(headers) => { return formatResponse(headers, body); },
				(afterHeadersErr) => { return formatResponse({}, afterHeadersErr || error); },
			);
		}

		/*	Begin processing and executing request. This should include
			expects/notExpects to determine afterSuccess vs afterFailure	*/
		return generateAndExecuteRequest(params)

		.then(
			(responePayload) => {

				const { body, response } = responePayload;

				return flowExecutionFunction('afterRequest', 'afterSuccess', body, params, response)
				.then(
					(payload) => { return finalize(null, payload, response); },
					(afterSuccessError) => { return finalize(afterSuccessError, body, response); }
				);

			},
			(errorPayload) => {

				const { payload = errorPayload, response = {} } = errorPayload;

				function rejectAfterHeaders (error) {
					return finalize(error, payload, response);
				}

				return flowExecutionFunction('afterRequest', 'afterFailure', payload, params, response)
				.then(rejectAfterHeaders, rejectAfterHeaders);

			}
		);

	};

};

//TODO - should move this out and perform before coreMethodFlow is invoked; such that validation isn't occuring during production mode
//Validate the methodConfig
function validateCoreConfig (methodConfig) {

	if (!_.isPlainObject(methodConfig)) {
		throw new Error('addMethod failed - the methodConfig must either be an object or function.');
	}

	if (_.isDefined(methodConfig.globals)) {
		if ( !_.isPlainObject(methodConfig.globals) && !_.isBoolean(methodConfig.globals) ) {
			throw new Error('addMethod failed - the `globals` in methodConfig must either be an boolean or object.');
		}
	}

	const validTypes = [ 'rest', 'soap', 'graphql' ];
	if (!_.includes(validTypes, (methodConfig.type || '').toLowerCase())) {
		throw new Error(`The \`type\` attribute must be one of these parameters: \n\t${validTypes.join(', ')}.`);
	}

	//before, beforeRequest, afterSuccess, afterFailure, and afterHeaders can be checked if their functions if provided
	const invalidProperty = _.findKey(
		{
			before: methodConfig.before,
			beforeRequest: methodConfig.beforeRequest,
			afterSuccess: methodConfig.afterSuccess,
			afterFailure: methodConfig.afterFailure,
			afterHeaders: methodConfig.afterHeaders
		},
		(value) => { return _.isDefined(value) && !_.isFunction(value); }
	);
	if (invalidProperty) {
		throw new Error(`addMethod failed - the \`${invalidProperty}\` in the methodConfig must be a function.`);
	}

}

//TODO
//Procure a globalConfig relative to the method being added
//First param should be methodConfig - assume globals is true if not specified
function getRelativeGlobalConfig ( { globals = true }, globalConfig = {} ) {

	//Processing globals - this is known before runtime, so can be done now
	const globalPropList = [ 'before', 'beforeRequest', 'expects', 'notExpects', 'afterSuccess', 'afterFailure', 'afterHeaders' ];

	//Creating a globalConfig object relative to this method
	return _.zipObject(
		globalPropList,
		_.map(globalPropList, (propVal) => {
			return ( _.get(globals, propVal, globals) ? globalConfig[propVal] : undefined );
		})
	);

}
