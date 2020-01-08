const assert	= require('assert');

const _	= require('lodash');

const before = require('../../lib/processor/before');
const throwTest = require('../testUtils/throwTest');
const devFlagTest = require('../testUtils/devFlagTest');

/* eslint-disable no-unused-vars */
describe('processor.before', function () {

	//TODO: add tests to coreFlow tests to ensure globals flase is processed correctly

	it('should be a function', () => {
		assert(_.isFunction(before));
	});

	it('should return a promise', () => {
		const thenable = before(
			() => {},
			() => {},
			{}
		).then;
		assert(_.isFunction(thenable));
	});

	it('should execute global first, then method', async function () {

		const returnedParams = await before(
			(params) => { return (params.test -= 4, params); },
			(params) => { return (params.test /= 2, params); },
			{
				id: 'abc123',
				test: 10
			}
		);

		assert.strictEqual(returnedParams.id, 'abc123');
		assert.strictEqual(returnedParams.test, 1);

	});

	it('should execute global first, then method, with both returning new/unreferenced objects', async function () {

		const returnedParams = await before(
			(params) => {
				if (!params.notes) {
					throw new Error('notes does not exist');
				}
				return {
					...params,
					description: 'World'
				};
			},
			(params) => {
				return {
					...params,
					notes: 'Hello'
				};
			},
			{
				id: 'abc123'
			}
		);

		assert.deepEqual(returnedParams, {
			id: 'abc123',
			notes: 'Hello',
			description: 'World'
		});

		const overwrittenParamsObject = await before(
			(params) => {
				if (!params.notes) {
					throw new Error('notes does not exist');
				}
				return { description: 'World' };
			},
			(params) => {
				return { notes: 'Hello' };
			},
			{ id: 'abc123' }
		);

		assert.deepEqual(overwrittenParamsObject, { description: 'World' });

	});

	it('should not execute global if not provided ', async function () {

		const returnedParams = await before(
			(params) => { return (params.test -= 4, params); },
			undefined,
			{
				test: 10
			}
		);

		assert.strictEqual(returnedParams.test, 6);

	});

	it('should allow global to be a promise', async function () {

		const returnedParams = await before(
			(params) => {
				return new Promise((resolve, reject) => {
					resolve((params.test -= 4, params));
				});
			},
			undefined,
			{
				test: 10
			}
		);

		assert.strictEqual(returnedParams.test, 6);


	});

	throwTest(
		'should error when non-object is returned (except undefined)',
		before,
		[
			() => { return null; },
			undefined,
			{
				id: 'abc123'
			}
		],
		'`before` must return an object.'
	);

	it('should not execute method if not provided', async function () {

		const returnedParams = await before(
			undefined,
			(params) => { return (params.test /= 2, params); },
			{
				test: 10
			}
		);

		assert.strictEqual(returnedParams.test, 5);


	});

	it('should allow method to be a promise', async function () {

		const returnedParams = await before(
			undefined,
			(params) => {
				return new Promise((resolve, reject) => {
					resolve((params.test /= 2, params));
				});
			},
			{
				test: 10
			}
		);

		assert.strictEqual(returnedParams.test, 5);


	});

	it('should do nothing if neither global or method is provided', async function () {

		const returnedParams = await before(
			undefined,
			undefined,
			{
				test: 10
			}
		);

		assert.strictEqual(returnedParams.test, 10);

	});

	throwTest(
		'should throw on global before local',
		before,
		[
			(params) => { throw new Error('ERROR THROWN'); },
			(params) => { return (params.test /= 2, params); },
			{
				test: 10
			}
		],
		'ERROR THROWN'
	);

	throwTest(
		'should throw on local',
		before,
		[
			(params) => { return (params.test /= 2, params); },
			(params) => { throw new Error('ERROR THROWN'); },
			{
				test: 10
			}
		],
		'ERROR THROWN'
	);

	describe('(to be deprecated) should use reference params if modified but not returned (and console warn)', function () {

		const sampleGlobal = function (params) {
			params.notes = 'Hello';
		};

		const sampleMethodConfig = function (params) {
			params.notes += ' World';
		};

		const originalParams = {
			id: 'abc123',
			notes: ''
		};

		it('global - no local `before`', async function () {
			const returnedParams = await before(undefined, sampleGlobal, _.cloneDeep(originalParams));
			assert.deepEqual(
				returnedParams,
				{
					id: 'abc123',
					notes: 'Hello'
				}
			);
		});

		it('global - non-returning local `before`', async function () {
			const returnedParams = await before(
				() => {},
				sampleGlobal,
				_.cloneDeep(originalParams)
			);
			assert.deepEqual(
				returnedParams,
				{
					id: 'abc123',
					notes: 'Hello'
				}
			);
		});

		it('method - no global `before`', async function () {
			const returnedParams = await before(
				sampleMethodConfig,
				undefined,
				_.cloneDeep(originalParams)
			);
			assert.deepEqual(
				returnedParams,
				{
					id: 'abc123',
					notes: ' World'
				}
			);
		});

		it('method - non-returning global `before`', async function () {
			const returnedParams = await before(
				sampleMethodConfig,
				() => {},
				_.cloneDeep(originalParams)
			);
			assert.deepEqual(
				returnedParams,
				{
					id: 'abc123',
					notes: ' World'
				}
			);
		});

		it('both', async function () {
			const returnedParams = await before(
				sampleMethodConfig,
				sampleGlobal,
				_.cloneDeep(originalParams)
			);
			assert.deepEqual(
				returnedParams,
				{
					id: 'abc123',
					notes: 'Hello World'
				}
			);
		});

	});

	it('should pass on global modification even if method is undefined', async function () {

		const originalParams = {
			id: 'abc123',
			notes: ''
		};

		const returnedParams = await before(
			function (params) {
				if (!params.notes) {
					throw new Error('notes does not exist in params');
				}
				assert(params.notes);
			},
			function (params) {
				return { //new object instead of same referebce object
					...params,
					notes: 'Hello'
				};
			},
			_.cloneDeep(originalParams)
		);

		assert.deepEqual(
			returnedParams,
			{
				id: 'abc123',
				notes: 'Hello'
			}
		);

	});

	describe('should throw an error if params is modified but not returned in development mode', function () {

		const sampleMethodBefore = function (params) {
			params.notes += ' World';
		};

		const originalParams = {
			id: 'abc123',
			notes: ''
		};

		devFlagTest('global', async function () {
			await before(
				undefined,
				function (params) {
					params.notes = 'Hello';
				},
				_.cloneDeep(originalParams)
			)
			.catch((modError) => {
				assert.strictEqual(modError.message, 'Modification by reference is deprecated. `before` must return the modified object.');
			});
		});

		devFlagTest('method', async function () {
			await before(
				sampleMethodBefore,
				undefined,
				_.cloneDeep(originalParams)
			)
			.catch((modError) => {
				assert.strictEqual(modError.message, 'Modification by reference is deprecated. `before` must return the modified object.');
			});
		});

		devFlagTest('valid global but invalid method', async function () {
			await before(
				sampleMethodBefore,
				function (params) {
					params.notes = 'Hello';
					return params;
				},
				_.cloneDeep(originalParams)
			)
			.catch((modError) => {
				assert.strictEqual(modError.message, 'Modification by reference is deprecated. `before` must return the modified object.');
			});
		});

	});

});
