const assert	= require('assert');

const _	= require('lodash');

const beforeRequest = require('../../lib/processor/beforeRequest');
const throwTest = require('../testUtils/throwTest');
const devFlagTest = require('../testUtils/devFlagTest');

/* eslint-disable no-unused-vars */
describe('processor.beforeRequest', function () {

	//TODO: add tests to coreFlow tests to ensure globals flase is processed correctly

	it('should be a function', () => {
		assert(_.isFunction(beforeRequest));
	});

	it('should return a promise', () => {
		const thenable = beforeRequest(
			() => {},
			() => {},
			{}
		).then;
		assert(_.isFunction(thenable));
	});

	it('should execute global first, then method', async function () {

		const returnedRequest = await beforeRequest(
			(request) => { return (request.url += '&order=asc', request.data += 'abc', request); },
			(request) => { return (request.data += '123', request); },
			{
				method: 'post',
				url: 'test.com/search?testSuite=123',
				data: 'xyz'
			}
		);

		assert.deepEqual(
			returnedRequest,
			{
				method: 'post',
				url: 'test.com/search?testSuite=123&order=asc',
				data: 'xyz123abc'
			}
		);

	});

	it('should execute global first, then method, with both returning new/unreferenced objects', async function () {

		const sampleParams = {
			user_id: 123
		};

		const returnedRequest = await beforeRequest(
			function (request, params) {
				assert.deepEqual(params, sampleParams);
				assert(request.url);
				request.url += '&test=123';
				return {
					...request,
					data: {}
				};
			},
			function (request, params) {
				assert.deepEqual(params, sampleParams);
				const url = request.url +  '?hello=world';
				return {
					...request,
					url
				};
			},
			{
				method: 'get',
				url: 'test.com'
			},
			sampleParams
		);

		assert.deepEqual(
			returnedRequest,
			{
				method: 'get',
				url: 'test.com?hello=world&test=123',
				data: {}
			}
		);

		const overwrittenRequestObject = await beforeRequest(
			function ({ method, url }, params) {
				assert.deepEqual(params, sampleParams);
				assert(url);
				url += '&test=123';
				return {
					method,
					url,
					data: {}
				};
			},
			function (request, params) {
				assert.deepEqual(params, sampleParams);
				const url = request.url +  '?hello=world';
				return {
					method: 'get',
					url
				};
			},
			{
				method: 'get',
				url: 'test.com'
			},
			sampleParams
		);

		assert.deepEqual(
			overwrittenRequestObject,
			{
				method: 'get',
				url: 'test.com?hello=world&test=123',
				data: {}
			}
		);

	});

	it('should have `params` as second argument of function', async () => {

		const originalParams = {
			id: 'abc123',
			notes: ''
		};

		await beforeRequest(
			(request, params) => {
				assert.deepEqual(originalParams, params);
				return (request.url += '&order=asc', request.data += 'abc', request);
			},
			(request, params) => {
				assert.deepEqual(originalParams, params);
				return (request.data += '123', request);
			},
			{
				method: 'post',
				url: 'test.com/search?testSuite=123',
				data: 'xyz'
			},
			originalParams
		);

	});

	it('should not execute global if not provided ', async function () {

		const returnedRequest = await beforeRequest(
			undefined,
			(request) => { return (request.data += 'abc', request); },
			{
				data: 'xyz'
			}
		);

		assert.strictEqual(returnedRequest.data, 'xyzabc');

	});

	it('should allow global to be a promise', async function () {

		const returnedRequest = await beforeRequest(
			undefined,
			(request) => {
				return new Promise(function (resolve, reject) {
					resolve((request.data += 'abc', request));
				});
			},
			{
				data: 'xyz'
			}
		);

		assert.strictEqual(returnedRequest.data, 'xyzabc');

	});

	it('should not execute method if not provided', async function () {

		const returnedRequest = await beforeRequest(
			(request) => { return (request.data += '123', request); },
			undefined,
			{
				data: 'xyz'
			}
		);

		assert.strictEqual(returnedRequest.data, 'xyz123');

	});

	it('should allow method to be a promise', async function () {

		const returnedRequest = await beforeRequest(
			(request) => {
				return new Promise(function (resolve, reject) {
					resolve((request.data += '123', request));
				});
			},
			undefined,
			{
				data: 'xyz'
			}
		);

		assert.strictEqual(returnedRequest.data, 'xyz123');

	});

	it('should execute normally with both async', async function () {

		const returnedRequest = await beforeRequest(
			(request) => {
				return new Promise((resolve, reject) => {
					resolve((request.url += '&order=asc', request.data += 'abc', request));
				});
			},
			(request) => {
				return new Promise((resolve, reject) => {
					resolve((request.data += '123', request));
				});
			},
			{
				method: 'post',
				url: 'test.com/search?testSuite=123',
				data: 'xyz'
			}
		);

		assert.deepEqual(
			returnedRequest,
			{
				method: 'post',
				url: 'test.com/search?testSuite=123&order=asc',
				data: 'xyz123abc'
			}
		);

	});

	it('should do nothing if neither global or method is provided', async function () {

		const sampleRequest = {
			url: 'test.com/create',
			data: 'xyz'
		};

		const returnedRequest = await beforeRequest(
			undefined,
			undefined,
			_.cloneDeep(sampleRequest)
		);

		assert.deepEqual(returnedRequest, sampleRequest);

	});

	throwTest(
		'should throw on global before method',
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
		'should throw on method',
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

	describe('should error when non-object is returned (except undefined) ', () => {

		throwTest(
			'global',
			beforeRequest,
			[
				undefined,
				function (request) {
					return null;
				},
				{},
				{
					method: 'get',
					url: 'test.com'
				}
			],
			'`beforeRequest` must return an object.'
		);

		throwTest(
			'method',
			beforeRequest,
			[
				function (request) {
					return 123;
				},
				undefined,
				{},
				{
					method: 'get',
					url: 'test.com'
				}
			],
			'`beforeRequest` must return an object.'
		);

	});

	describe('should use reference request if modified but not returned (and console warn)', function () {

		const globalBeforeRequest = function (request) {
			request.url += '?hello=world';
		};

		const methodBeforeRequest = function (request) {
			request.url += '&test=123';
		};

		const originalRequest = {
			method: 'get',
			url: 'test.com'
		};

		it('global - no local `beforeRequest`', async function () {
			const returnedRequest = await beforeRequest(undefined, globalBeforeRequest, _.cloneDeep(originalRequest));

			assert.deepEqual(
				returnedRequest,
				{
					method: 'get',
					url: 'test.com?hello=world'
				}
			);
		});

		it('global - non-returning local `beforeRequest`', async function () {
			const returnedRequest = await beforeRequest(
				() => {},
				globalBeforeRequest,
				_.cloneDeep(originalRequest)
			);

			assert.deepEqual(
				returnedRequest,
				{
					method: 'get',
					url: 'test.com?hello=world'
				}
			);
		});

		it('method - no global `beforeRequest`', async function () {
			const returnedRequest = await beforeRequest(
				methodBeforeRequest,
				undefined,
				_.cloneDeep(originalRequest)
			);

			assert.deepEqual(
				returnedRequest,
				{
					method: 'get',
					url: 'test.com&test=123'
				}
			);
		});

		it('method - non-returning global `beforeRequest`', async function () {
			const returnedRequest = await beforeRequest(
				methodBeforeRequest,
				() => {},
				_.cloneDeep(originalRequest)
			);

			assert.deepEqual(
				returnedRequest,
				{
					method: 'get',
					url: 'test.com&test=123'
				}
			);
		});

		it('both', async function () {
			const returnedRequest = await beforeRequest(
				methodBeforeRequest,
				globalBeforeRequest,
				_.cloneDeep(originalRequest)
			);

			assert.deepEqual(
				returnedRequest,
				{
					method: 'get',
					url: 'test.com?hello=world&test=123'
				}
			);
		});

	});

	it('should pass on global modification even if method is undefined', async function () {

		const originalRequest = {
			method: 'get',
			url: 'test.com'
		};

		const returnedRequest = await beforeRequest(
			function (request) {
				if (!request.url) {
					throw new Error('url does not exist in request object');
				}
			},
			function (request) {
				const url = request.url +  '?hello=world';
				return { //new object instead of same referebce object
					...request,
					url
				};
			},
			_.cloneDeep(originalRequest)
		);

		assert.deepEqual(
			returnedRequest,
			{
				method: 'get',
				url: 'test.com?hello=world'
			}
		);

	});

	describe('should throw an error if request is modified but not returned in development mode', function () {

		const methodBeforeRequest = function (request) {
			request.url += '&test=123';
		};

		const originalRequest = {
			method: 'get',
			url: 'test.com'
		};

		devFlagTest('global', async function () {
			await beforeRequest(
				undefined,
				function (request) {
					request.url += '?hello=world';
				},
				_.cloneDeep(originalRequest)
			)
			.catch((modError) => {
				assert.strictEqual(modError.message, 'Modification by reference is deprecated. `beforeRequest` must return the modified object.');
			});
		});

		devFlagTest('method', async function () {
			await beforeRequest(
				methodBeforeRequest,
				undefined,
				_.cloneDeep(originalRequest)
			)
			.catch((modError) => {
				assert.strictEqual(modError.message, 'Modification by reference is deprecated. `beforeRequest` must return the modified object.');
			});
		});

		devFlagTest('valid global but invalid method', async function () {
			await beforeRequest(
				methodBeforeRequest,
				function (request) {
					request.url += '?hello=world';
					return request;
				},
				_.cloneDeep(originalRequest)
			)
			.catch((modError) => {
				assert.strictEqual(modError.message, 'Modification by reference is deprecated. `beforeRequest` must return the modified object.');
			});
		});

	});

});
