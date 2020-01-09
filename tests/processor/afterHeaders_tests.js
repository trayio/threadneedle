const assert = require('assert');
const _	= require('lodash');

const afterHeaders = require('../../lib/processor/afterHeaders');
const throwTest = require('../testUtils/throwTest');

/* eslint-disable no-unused-vars */
describe('processor.afterHeaders', () => {

	//TODO: add tests to coreFlow tests to ensure globals flase is processed correctly

	it('should be a function', () => {
		assert(_.isFunction(afterHeaders));
	});

	it('should execute global first, then method', async () => {

		const returnedHeaders = await afterHeaders(
			(body, params, res) => { return { test: 'abc' }; },
			(body, params, res) => { return (request.data += '123', request); },
			null,
			{},
			{
				data: 'xyz'
			},
			{}
		);

		assert.strictEqual(returnedHeaders.data, 'xyz123abc');

	});

	// it('should function does not execute global if not provided ', async () => {
	//
	// 	const returnedHeaders = await afterHeaders(
	// 		(request) => { return (request.data += 'abc', request); },
	// 		undefined,
	// 		{
	// 			data: 'xyz'
	// 		}
	// 	)
	//
	// 	.then(function (returnedHeaders) {
	// 		assert.strictEqual(returnedHeaders.data, 'xyzabc');
	// 		done();
	// 	});
	//
	// });
	//
	// it('should function allows global to be a promise', async () => {
	//
	// 	const returnedHeaders = await afterHeaders(
	// 		(request) => {
	// 			return Promise.resolve((request.data += 'abc', request));
	// 		},
	// 		undefined,
	// 		{
	// 			data: 'xyz'
	// 		}
	// 	);
	//
	// 	assert.strictEqual(returnedHeaders.data, 'xyzabc');
	//
	// });
	//
	// it('should function does not execute method if not provided', async () => {
	//
	// 	const returnedHeaders = await afterHeaders(
	// 		undefined,
	// 		(request) => { return (request.data += '123', request); },
	// 		{
	// 			data: 'xyz'
	// 		}
	// 	)
	//
	// 	.then(function (returnedHeaders) {
	// 		assert.strictEqual(returnedHeaders.data, 'xyz123');
	// 		done();
	// 	});
	//
	// });
	//
	// it('should function allows method to be a promise', async () => {
	//
	// 	const returnedHeaders = await afterHeaders(
	// 		undefined,
	// 		(request) => {
	// 			return Promise.resolve((request.data += '123', request));
	// 		},
	// 		{
	// 			data: 'xyz'
	// 		}
	// 	)
	//
	// 	.then(function (returnedHeaders) {
	// 		assert.strictEqual(returnedHeaders.data, 'xyz123');
	// 		done();
	// 	});
	//
	// });
	//
	// it('should function does nothing if neither global or method is provided', async () => {
	//
	// 	const returnedHeaders = await afterHeaders(
	// 		undefined,
	// 		undefined,
	// 		{
	// 			data: 'xyz'
	// 		}
	// 	)
	//
	// 	.then(function (returnedHeaders) {
	// 		assert.strictEqual(returnedHeaders.data, 'xyz');
	// 		done();
	// 	});
	//
	// });
	//
	// throwTest(
	// 	'should function should throw on global before method',
	// 	afterHeaders,
	// 	[
	// 		(request) => { throw new Error('ERROR THROWN') },
	// 		(request) => { return (request.data += '123', request); },
	// 		{
	// 			data: 'xyz'
	// 		}
	// 	],
	// 	'ERROR THROWN'
	// );
	//
	// throwTest(
	// 	'should function should throw on method',
	// 	afterHeaders,
	// 	[
	// 		(request) => { return (request.data += 'abc', request); },
	// 		(request) => { throw new Error('ERROR THROWN') },
	// 		{
	// 			data: 'xyz'
	// 		}
	// 	],
	// 	'ERROR THROWN'
	// );

});


///TODO ------
// it('should run the global before method when declared', function (done) {
// 	const sampleThread = {
// 		_globalOptions: {
// 			afterHeaders: function (error, params, body, res) {
// 				return {
// 					success: true
// 				};
// 			}
// 		}
// 	};
//
// 	globalize.afterHeaders.call(sampleThread, {}, null, {}, {}, {})
// 	.then(function (header) {
// 		assert.deepEqual(header, {
// 			success: true
// 		});
// 	})
// 	.then(done, done);
// });
//
// it('should allow for a global promise async', function (done) {
// 	const sampleThread = {
// 		_globalOptions: {
// 			afterHeaders: function (error, params, body, res) {
// 				return when.promise(function (resolve, reject) {
// 					resolve({
// 						success: true
// 					});
// 				});
// 			}
// 		}
// 	};
//
// 	globalize.afterHeaders.call(sampleThread, {}, {})
// 	.then(function (header) {
// 		assert.deepEqual(header, {
// 			success: true
// 		});
// 	})
// 	.then(done, done);
// });
//
// it('should call the global promise before the local one', function (done) {
// 	let calledFirst;
// 	let calls = 0;
//
// 	const sampleThread = {
// 		_globalOptions: {
// 			afterHeaders: function (error, params, body, res) {
// 				calledFirst = calledFirst || 'global';
// 				calls++;
// 			}
// 		}
// 	};
//
// 	globalize.afterHeaders.call(sampleThread, {
// 		afterHeaders: function () {
// 			calledFirst = calledFirst || 'local';
// 			calls++;
// 		}
// 	}, {})
// 	.then(function (params) {
// 		assert.equal(calledFirst, 'global');
// 		assert.equal(calls, 2);
// 	})
// 	.then(done, done);
// });
//
// it('should make local take precedence over global via defaultsDeep', function (done) {
// 	const sampleThread = {
// 		_globalOptions: {
// 			afterHeaders: function (error, params, body, res) {
// 				return {
// 					test: 123
// 				};
// 			}
// 		}
// 	};
//
// 	globalize.afterHeaders.call(sampleThread, {
// 		afterHeaders: function () {
// 			return {
// 				test: 456
// 			};
// 		}
// 	}, {})
// 	.then(function (headers) {
// 		assert.equal(headers.test, 456);
// 	})
// 	.then(done, done);
// });
//
// describe('should throw an error if headers is not an object in development mode', function () {
//
// 	const AFTER_HEADERS_RETURN_ERROR = '`afterHeaders` must return an object.';
//
// 	const sampleMethodConfig = {
// 		afterHeaders: function (request) {
// 			return null;
// 		}
// 	};
//
// 	const originalRequest = {
// 		method: 'get',
// 		url: 'test.com'
// 	};
//
// 	handleDevFlagTest('global', function (done) {
// 		globalize.afterHeaders.call(
// 			{
// 				_globalOptions: {
// 					afterHeaders: function (request) {
// 						return null;
// 					}
// 				}
// 			},
// 			{},
// 			null,
// 			{},
// 			{},
// 			{}
// 		)
// 		.then(assert.fail)
// 		.catch((returnError) => {
// 			assert.strictEqual(returnError.message, AFTER_HEADERS_RETURN_ERROR);
// 		})
// 		.then(done, done);
// 	});
//
// 	handleDevFlagTest('method', function (done) {
// 		globalize.afterHeaders.call(
// 			{ _globalOptions: {} },
// 			sampleMethodConfig,
// 			null,
// 			{},
// 			{},
// 			{}
// 		)
// 		.then(assert.fail)
// 		.catch((returnError) => {
// 			assert.strictEqual(returnError.message, AFTER_HEADERS_RETURN_ERROR);
// 		})
// 		.then(done, done);
// 	});
//
// 	handleDevFlagTest('ok global but invalid method', function (done) {
// 		globalize.afterHeaders.call(
// 			{
// 				_globalOptions: {
// 					afterHeaders: function (request) {
// 						return {};
// 					}
// 				}
// 			},
// 			sampleMethodConfig,
// 			null,
// 			{},
// 			{},
// 			{}
// 		)
// 		.then(assert.fail)
// 		.catch((returnError) => {
// 			assert.strictEqual(returnError.message, AFTER_HEADERS_RETURN_ERROR);
// 		})
// 		.then(done, done);
// 	});
//
// });
//
// describe('should not run the globals when globals is false', function (done) {
// 	const sampleThread = {
// 		_globalOptions: {
// 			afterHeaders: function (error, params, body, res) {
// 				return {
// 					success: true
// 				};
// 			}
// 		}
// 	};
//
// 	it('all globals false', (done) => {
// 		globalize.afterHeaders.call(sampleThread, {
// 			globals: false
// 		}, {})
// 		.then(function (headers) {
// 			assert.deepEqual(headers, {});
// 		})
// 		.then(done, done);
//
// 	});
//
// 	it('only afterHeaders globals false', (done) => {
// 		globalize.afterHeaders.call(sampleThread, {
// 			globals: {
// 				afterHeaders: false
// 			}
// 		}, {})
// 		.then(function (headers) {
// 			assert.deepEqual(headers, {});
// 		})
// 		.then(done, done);
// 	});
//
// });
