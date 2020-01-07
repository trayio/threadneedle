const assert	= require('assert');

const _	= require('lodash');

const beforeRequest = require('../../lib/processor/beforeRequest');
const throwTest = require('../testUtils/throwTest');
const devFlagTest = require('../testUtils/devFlagTest');

/* eslint-disable no-unused-vars */
describe('processor.beforeRequest', function () {

	//TODO: add tests to coreFlow tests to ensure globals flase is processed correctly

	it('beforeRequest is a function', () => {
		assert(_.isFunction(beforeRequest));
	});

	it('beforeRequest returns a promise', () => {
		const thenable = beforeRequest(
			() => {},
			() => {},
			{}
		).then;
		assert(_.isFunction(thenable));
	});

	it('beforeRequest function executes global\'s before local', async function () {

		const value = await beforeRequest(
			(request) => { return (request.data += 'abc', request); },
			(request) => { return (request.data += '123', request); },
			{
				data: 'xyz'
			}
		);

		assert.strictEqual(value.data, 'xyz123abc');

	});

	it('beforeRequest function does not execute global if not provided ', async function () {

		const value = await beforeRequest(
			(request) => { return (request.data += 'abc', request); },
			undefined,
			{
				data: 'xyz'
			}
		);

		assert.strictEqual(value.data, 'xyzabc');

	});

	it('beforeRequest function allows global to be a promise', async function () {

		const value = await beforeRequest(
			(request) => {
				return new Promise(function (resolve, reject) {
					resolve((request.data += 'abc', request));
				});
			},
			undefined,
			{
				data: 'xyz'
			}
		);

		assert.strictEqual(value.data, 'xyzabc');

	});

	it('beforeRequest function does not execute local if not provided', async function () {

		const value = await beforeRequest(
			undefined,
			(request) => { return (request.data += '123', request); },
			{
				data: 'xyz'
			}
		);

		assert.strictEqual(value.data, 'xyz123');

	});

	it('beforeRequest function allows local to be a promise', async function () {

		const value = await beforeRequest(
			undefined,
			(request) => {
				return new Promise(function (resolve, reject) {
					resolve((request.data += '123', request));
				});
			},
			{
				data: 'xyz'
			}
		);

		assert.strictEqual(value.data, 'xyz123');

	});

	it('beforeRequest function does nothing if neither global or local is provided', async function () {

		const value = await beforeRequest(
			undefined,
			undefined,
			{
				data: 'xyz'
			}
		);

		assert.strictEqual(value.data, 'xyz');

	});

	throwTest(
		'beforeRequest function should throw on global before local',
		beforeRequest,
		[
			(request) => { throw new Error('ERROR THROWN'); },
			(request) => { return (request.data += '123', request); },
			{
				data: 'xyz'
			}
		],
		'ERROR THROWN'
	);

	throwTest(
		'beforeRequest function should throw on local',
		beforeRequest,
		[
			(request) => { return (request.data += 'abc', request); },
			(request) => { throw new Error('ERROR THROWN'); },
			{
				data: 'xyz'
			}
		],
		'ERROR THROWN'
	);


	//TODO ---------------

	// it('should run normally with global first and then method', function (done) {
	//
	// 	const sampleParams = {
	// 		user_id: 123
	// 	};
	//
	// 	const sampleGlobal = {
	// 		_globalOptions: {
	// 			beforeRequest: function (request, params) {
	// 				assert.deepEqual(params, sampleParams);
	// 				request.url += '?hello=world';
	// 				return request;
	// 			}
	// 		}
	// 	};
	//
	// 	const sampleMethodConfig = {
	// 		beforeRequest: function (request, params) {
	// 			assert.deepEqual(params, sampleParams);
	// 			request.url += '&test=123';
	// 			return request;
	// 		}
	// 	};
	//
	// 	globalize.beforeRequest.call(
	// 		sampleGlobal,
	// 		sampleMethodConfig,
	// 		{
	// 			method: 'get',
	// 			url: 'test.com'
	// 		},
	// 		sampleParams
	// 	)
	// 	.then(function (request) {
	// 		assert.deepEqual(
	// 			request,
	// 			{
	// 				method: 'get',
	// 				url: 'test.com?hello=world&test=123'
	// 			}
	// 		);
	// 	})
	// 	.then(done, done);
	// });
	//
	// it('should run normally with global first and then method - new object', function (done) {
	//
	// 	const sampleParams = {
	// 		user_id: 123
	// 	};
	//
	// 	const sampleGlobal = {
	// 		_globalOptions: {
	// 			beforeRequest: function (request, params) {
	// 				assert.deepEqual(params, sampleParams);
	// 				const url = request.url +  '?hello=world';
	// 				return {
	// 					method: 'get',
	// 					url
	// 				};
	// 			}
	// 		}
	// 	};
	//
	// 	const sampleMethodConfig = {
	// 		beforeRequest: function (request, params) {
	// 			assert.deepEqual(params, sampleParams);
	// 			assert(request.url);
	// 			request.url += '&test=123';
	// 			return {
	// 				...request,
	// 				data: {}
	// 			};
	// 		}
	// 	};
	//
	// 	globalize.beforeRequest.call(
	// 		sampleGlobal,
	// 		sampleMethodConfig,
	// 		{
	// 			method: 'get',
	// 			url: 'test.com'
	// 		},
	// 		sampleParams
	// 	)
	// 	.then(function (request) {
	// 		assert.deepEqual(
	// 			request,
	// 			{
	// 				method: 'get',
	// 				url: 'test.com?hello=world&test=123',
	// 				data: {}
	// 			}
	// 		);
	// 	})
	// 	.then(done, done);
	// });
	//
	// it('should run async normally with  global first and then method', function (done) {
	// 	const sampleGlobal = {
	// 		_globalOptions: {
	// 			beforeRequest: function (request) {
	// 				request.url += '?hello=world';
	// 				return when.resolve(request);
	// 			}
	// 		}
	// 	};
	//
	// 	const sampleMethodConfig = {
	// 		beforeRequest: function (request) {
	// 			request.url += '&test=123';
	// 			return when.resolve(request);
	// 		}
	// 	};
	//
	// 	globalize.beforeRequest.call(
	// 		sampleGlobal,
	// 		sampleMethodConfig,
	// 		{
	// 			method: 'get',
	// 			url: 'test.com'
	// 		}
	// 	)
	// 	.then(function (request) {
	// 		assert.deepEqual(
	// 			request,
	// 			{
	// 				method: 'get',
	// 				url: 'test.com?hello=world&test=123'
	// 			}
	// 		);
	// 	})
	// 	.then(done, done);
	// });
	//
	// it('should error when non-object is returned (except undefined)', function (done) {
	// 	globalize.beforeRequest.call(
	// 		{
	// 			_globalOptions: {
	// 				beforeRequest: function (request) {
	// 					return null;
	// 				}
	// 			}
	// 		},
	// 		{},
	// 		{
	// 			method: 'get',
	// 			url: 'test.com'
	// 		}
	// 	)
	// 	.then(assert.fail)
	// 	.catch((returnError) => {
	// 		assert.strictEqual(returnError.message, '`beforeRequest` must return an object.');
	// 	})
	// 	.then(done, done);
	// });
	//
	// describe('should use reference request if modified but not returned (and console warn)', function () {
	//
	// 	const sampleGlobal = {
	// 		_globalOptions: {
	// 			beforeRequest: function (request) {
	// 				request.url += '?hello=world';
	// 			}
	// 		}
	// 	};
	//
	// 	const sampleMethodConfig = {
	// 		beforeRequest: function (request) {
	// 			request.url += '&test=123';
	// 		}
	// 	};
	//
	// 	const originalRequest = {
	// 		method: 'get',
	// 		url: 'test.com'
	// 	};
	//
	// 	it('global - no local `beforeRequest`', function (done) {
	// 		globalize.beforeRequest.call(sampleGlobal, {}, _.cloneDeep(originalRequest))
	// 		.then(function (request) {
	// 			assert.deepEqual(
	// 				request,
	// 				{
	// 					method: 'get',
	// 					url: 'test.com?hello=world'
	// 				}
	// 			);
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// 	it('global - non-returning local `beforeRequest`', function (done) {
	// 		globalize.beforeRequest.call(
	// 			sampleGlobal,
	// 			{ beforeRequest: () => {} },
	// 			_.cloneDeep(originalRequest)
	// 		)
	// 		.then(function (request) {
	// 			assert.deepEqual(
	// 				request,
	// 				{
	// 					method: 'get',
	// 					url: 'test.com?hello=world'
	// 				}
	// 			);
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// 	it('method - no global `beforeRequest`', function (done) {
	// 		globalize.beforeRequest.call(
	// 			{ _globalOptions: {} },
	// 			sampleMethodConfig,
	// 			_.cloneDeep(originalRequest)
	// 		)
	// 		.then(function (request) {
	// 			assert.deepEqual(
	// 				request,
	// 				{
	// 					method: 'get',
	// 					url: 'test.com&test=123'
	// 				}
	// 			);
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// 	it('method - non-returning global `beforeRequest`', function (done) {
	// 		globalize.beforeRequest.call(
	// 			{ _globalOptions: { beforeRequest: () => {} } },
	// 			sampleMethodConfig,
	// 			_.cloneDeep(originalRequest)
	// 		)
	// 		.then(function (request) {
	// 			assert.deepEqual(
	// 				request,
	// 				{
	// 					method: 'get',
	// 					url: 'test.com&test=123'
	// 				}
	// 			);
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// 	it('both', function (done) {
	// 		globalize.beforeRequest.call(
	// 			sampleGlobal,
	// 			sampleMethodConfig,
	// 			_.cloneDeep(originalRequest)
	// 		)
	// 		.then(function (request) {
	// 			assert.deepEqual(
	// 				request,
	// 				{
	// 					method: 'get',
	// 					url: 'test.com?hello=world&test=123'
	// 				}
	// 			);
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// });
	//
	// it('should pass on global modification even if method is undefined', function (done) {
	//
	// 	const originalRequest = {
	// 		method: 'get',
	// 		url: 'test.com'
	// 	};
	//
	// 	globalize.beforeRequest.call(
	// 		{
	// 			_globalOptions: {
	// 				beforeRequest: function (request) {
	// 					const url = request.url +  '?hello=world';
	// 					return { //new object instead of same referebce object
	// 						...request,
	// 						url
	// 					};
	// 				}
	// 			}
	// 		},
	// 		{
	// 			beforeRequest: function (request) {
	// 				if (!request.url) {
	// 					throw new Error('url does not exist in request object');
	// 				}
	// 			}
	// 		},
	// 		_.cloneDeep(originalRequest)
	// 	)
	// 	.then(function (request) {
	// 		assert.deepEqual(
	// 			request,
	// 			{
	// 				method: 'get',
	// 				url: 'test.com?hello=world'
	// 			}
	// 		);
	// 	})
	// 	.then(done, done);
	//
	// });
	//
	// describe('should throw an error if request is modified but not returned in development mode', function () {
	//
	// 	const sampleMethodConfig = {
	// 		beforeRequest: function (request) {
	// 			request.url += '&test=123';
	// 		}
	// 	};
	//
	// 	const originalRequest = {
	// 		method: 'get',
	// 		url: 'test.com'
	// 	};
	//
	// 	handleDevFlagTest('global', function (done) {
	// 		globalize.beforeRequest.call(
	// 			{
	// 				_globalOptions: {
	// 					beforeRequest: function (request) {
	// 						request.url += '?hello=world';
	// 					}
	// 				}
	// 			},
	// 			{},
	// 			_.cloneDeep(originalRequest)
	// 		)
	// 		.then(assert.fail)
	// 		.catch((modError) => {
	// 			assert.strictEqual(modError.message, 'Modification by reference is deprecated. `beforeRequest` must return the modified object.');
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// 	handleDevFlagTest('method', function (done) {
	// 		globalize.beforeRequest.call(
	// 			{ _globalOptions: {} },
	// 			sampleMethodConfig,
	// 			_.cloneDeep(originalRequest)
	// 		)
	// 		.then(assert.fail)
	// 		.catch((modError) => {
	// 			assert.strictEqual(modError.message, 'Modification by reference is deprecated. `beforeRequest` must return the modified object.');
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// 	handleDevFlagTest('ok global but invalid method', function (done) {
	// 		globalize.beforeRequest.call(
	// 			{
	// 				_globalOptions: {
	// 					beforeRequest: function (request) {
	// 						request.url += '?hello=world';
	// 						return request;
	// 					}
	// 				}
	// 			},
	// 			sampleMethodConfig,
	// 			_.cloneDeep(originalRequest)
	// 		)
	// 		.then(assert.fail)
	// 		.catch((modError) => {
	// 			assert.strictEqual(modError.message, 'Modification by reference is deprecated. `beforeRequest` must return the modified object.');
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// });
	//
	// describe('should not run global before when globals is false', function () {
	// 	const sampleGlobal = {
	// 		_globalOptions: {
	// 			beforeRequest: function (request) {
	// 				request.url += '?hello=world';
	// 				return request;
	// 			}
	// 		}
	// 	};
	//
	// 	const originalRequest = {
	// 		method: 'get',
	// 		url: 'test.com'
	// 	};
	//
	// 	it('all globals false', function (done) {
	// 		const sampleMethodConfig = {
	// 			globals: false,
	// 			beforeRequest: function (request) {
	// 				request.url += '&test=123';
	// 				return request;
	// 			}
	// 		};
	// 		globalize.beforeRequest.call(
	// 			sampleGlobal,
	// 			sampleMethodConfig,
	// 			_.cloneDeep(originalRequest)
	// 		)
	// 		.then(function (request) {
	// 			assert.deepEqual(request, {
	// 				method: 'get',
	// 				url: 'test.com&test=123'
	// 			});
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// 	it('only beforeRequest globals false', function (done) {
	// 		const sampleMethodConfig = {
	// 			globals: {
	// 				beforeRequest: false
	// 			},
	// 			beforeRequest: function (request) {
	// 				request.url += '&test=123';
	// 				return request;
	// 			}
	// 		};
	// 		globalize.beforeRequest.call(
	// 			sampleGlobal,
	// 			sampleMethodConfig,
	// 			_.cloneDeep(originalRequest)
	// 		)
	// 		.then(function (request) {
	// 			assert.deepEqual(request, {
	// 				method: 'get',
	// 				url: 'test.com&test=123'
	// 			});
	// 		})
	// 		.then(done, done);
	// 	});
	//
	//
	// });

});
