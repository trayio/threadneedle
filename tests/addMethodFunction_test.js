const assert = require('assert');
const fs = require('fs');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const when = require('when');
const randString = require('mout/random/randString');

const addMethodFunction = require('../lib/addMethod/addMethodFunction');

describe('#addMethodFunction', function () {

	const sampleParams = {
		'#auth': {
			token: 'abc'
		},
		example: '123'
	};

	describe('Validation', () => {

		it('should execute function if afterHeaders is undefined', async () => {
			const result = await addMethodFunction(
				{ _globalOptions: {} },
				(params) => {
					assert.strictEqual(sampleParams, params);
					return params.example;
				},
				undefined,
				sampleParams
			);

			assert.strictEqual(result.headers.error, undefined);
			assert.strictEqual(result.body, sampleParams.example);
		});

		it('should execute function if afterHeaders is a function', async () => {
			const result = await addMethodFunction(
				{ _globalOptions: {} },
				(params) => {
					assert.deepEqual(params, sampleParams);
					return params.example;
				},
				(error, params, body, res) => {
					assert.strictEqual(error, null);
					assert.deepEqual(params, sampleParams);
					assert.strictEqual(body, sampleParams.example);
					assert.strictEqual(res, null);
					return { test: 123 };
				},
				sampleParams
			);

			assert.strictEqual(result.headers.error, undefined);
			assert.strictEqual(result.headers.test, 123);
			assert.strictEqual(result.body, sampleParams.example);
		});

		it('should error if afterHeaders is neither undefined or a function', async () => {
			try {
				await addMethodFunction(
					{ _globalOptions: {} },
					(params) => {
						assert.deepEqual(params, sampleParams);
						return params.example;
					},
					null,
					sampleParams
				);
			} catch (addMethodFunctionError) {
				assert(_.includes(addMethodFunctionError.message, 'afterHeaders must be a function'));
			}
		});
	});

	describe('Running', () => {

		it('should work with basic example (returning in correct format)', async () => {
			const result = await addMethodFunction(
				{ _globalOptions: {} },
				(params) => {
					assert.strictEqual(sampleParams, params);
					return params.example;
				},
				undefined,
				sampleParams
			);

			assert(_.isPlainObject(result.headers));
			assert.strictEqual(result.body, sampleParams.example);
		});

		it('should work with async example (returning in correct format)', async () => {
			const result = await addMethodFunction(
				{ _globalOptions: {} },
				async (params) => {
					assert.strictEqual(sampleParams, params);
					return Promise.resolve(params.example);
				},
				undefined,
				sampleParams
			);

			assert(_.isPlainObject(result.headers));
			assert.strictEqual(result.body, sampleParams.example);
		});

		it('should catch and surface thrown error (in correct format)', async () => {
			try {
				const result = await addMethodFunction(
					{ _globalOptions: {} },
					(params) => {
						throw new Error('Testing error');
					},
					undefined,
					sampleParams
				);
				assert.fail(result);
			} catch (errorObject) {
				assert(_.isPlainObject(errorObject.headers));
				assert.strictEqual(errorObject.body.message, 'Testing error');
			}
		});

		it('should surface rejection (in correct format)', async () => {
			try {
				const result = await addMethodFunction(
					{ _globalOptions: {} },
					async (params) => {
						throw new Error('Testing error');
					},
					undefined,
					sampleParams
				);
				assert.fail(result);
			} catch (errorObject) {
				assert(_.isPlainObject(errorObject.headers));
				assert.strictEqual(errorObject.body.message, 'Testing error');
			}

			try {
				const result = await addMethodFunction(
					{ _globalOptions: {} },
					(params) => {
						return Promise.reject(new Error('Testing error'));
					},
					undefined,
					sampleParams
				);
				assert.fail(result);
			} catch (errorObject) {
				assert(_.isPlainObject(errorObject.headers));
				assert.strictEqual(errorObject.body.message, 'Testing error');
			}
		});

	});

	describe('Running - afterHeaders', () => {

		it('should modify header after "afterSuccess"', async () => {
			const result = await addMethodFunction(
				{ _globalOptions: {} },
				(params) => {
					assert.strictEqual(sampleParams, params);
					return params.example;
				},
				(error, params, body, res) => {
					assert.strictEqual(error, null);
					assert.deepEqual(params, sampleParams);
					assert.strictEqual(body, sampleParams.example);
					assert.strictEqual(res, null);
					return { test: 123 };
				},
				sampleParams
			);

			assert(_.isPlainObject(result.headers));
			assert.strictEqual(result.headers.test, 123);
			assert.strictEqual(result.body, sampleParams.example);
		});

		it('should push rejection to body after "afterSuccess"', async () => {
			try {
				const result = await addMethodFunction(
					{ _globalOptions: {} },
					(params) => {
						assert.strictEqual(sampleParams, params);
						return params.example;
					},
					(error, params, body, res) => {
						assert.strictEqual(error, null);
						assert.deepEqual(params, sampleParams);
						assert.strictEqual(body, sampleParams.example);
						assert.strictEqual(res, null);
						throw new Error('test error');
					},
					sampleParams
				);
				assert.fail(result);
			} catch (errorObject) {
				assert(_.isPlainObject(errorObject.headers));
				assert.deepEqual(errorObject.headers, {});
				assert.strictEqual(errorObject.body.message, 'test error');
			}
		});

		it('should modify headers after "afterFailure"', async () => {
			try {
				const result = await addMethodFunction(
					{ _globalOptions: {} },
					(params) => {
						assert.strictEqual(sampleParams, params);
						throw new Error('main function error');
					},
					(error, params, body, res) => {
						assert.strictEqual(error.message, 'main function error');
						assert.deepEqual(params, sampleParams);
						assert.strictEqual(body, null);
						assert.strictEqual(res, null);
						return { test: 123 };
					},
					sampleParams
				);
				assert.fail(result);
			} catch (errorObject) {
				assert(_.isPlainObject(errorObject.headers));
				assert.strictEqual(errorObject.headers.test, 123);
				assert.strictEqual(errorObject.body.message, 'main function error');
			}
		});

		it('should push rejection to body after "afterFailure"', async () => {
			try {
				const result = await addMethodFunction(
					{ _globalOptions: {} },
					(params) => {
						assert.strictEqual(sampleParams, params);
						throw new Error('main function error');
					},
					(error, params, body, res) => {
						assert.strictEqual(error.message, 'main function error');
						assert.deepEqual(params, sampleParams);
						assert.strictEqual(body, null);
						assert.strictEqual(res, null);
						throw new Error('afterHeaders function error');
					},
					sampleParams
				);
				assert.fail(result);
			} catch (errorObject) {
				assert(_.isPlainObject(errorObject.headers));
				assert.deepEqual(errorObject.headers, {});
				assert.strictEqual(errorObject.body.message, 'afterHeaders function error');
			}
		});

	});

});
