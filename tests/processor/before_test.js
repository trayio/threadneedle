const assert	= require('assert');

const _	= require('lodash');

const before = require('../../lib/processor/before');
const throwTest = require('../testUtils/throwTest');

describe('processor.before', function () {

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

		const value = await before(
			(params) => { return (params.test -= 4, params); },
			(params) => { return (params.test /= 2, params); },
			{
				id: 'abc123',
				test: 10
			}
		);

		assert.strictEqual(value.id, 'abc123');
		assert.strictEqual(value.test, 1);

	});

	it('should execute global first, then method, with both returning new/unreferenced objects', async function () {

		const value = await before(
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

		assert.deepEqual(value, {
			id: 'abc123',
			notes: 'Hello',
			description: 'World'
		});

		const overwrittenObject = await before(
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

		assert.deepEqual(overwrittenObject, { description: 'World' });

	});

	it('should not execute global if not provided ', async function () {

		const value = await before(
			(params) => { return (params.test -= 4, params); },
			undefined,
			{
				test: 10
			}
		);

		assert.strictEqual(value.test, 6);

	});

	it('should allow global to be a promise', async function () {

		const value = await before(
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

		assert.strictEqual(value.test, 6);


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

		const value = await before(
			undefined,
			(params) => { return (params.test /= 2, params); },
			{
				test: 10
			}
		);

		assert.strictEqual(value.test, 5);


	});

	it('should allow method to be a promise', async function () {

		const value = await before(
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

		assert.strictEqual(value.test, 5);


	});

	it('should do nothing if neither global or method is provided', async function () {

		const value = await before(
			undefined,
			undefined,
			{
				test: 10
			}
		);

		assert.strictEqual(value.test, 10);

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

	// -----------------------------------
	//TODO

	//
	// describe('should use reference params if modified but not returned (and console warn)', function () {
	//
	// 	const sampleGlobal = {
	// 		_globalOptions: {
	// 			before: function (params) {
	// 				params.notes = 'Hello';
	// 			}
	// 		}
	// 	};
	//
	// 	const sampleMethodConfig = {
	// 		before: function (params) {
	// 			params.notes += ' World';
	// 		}
	// 	};
	//
	// 	const originalParams = {
	// 		id: 'abc123',
	// 		notes: ''
	// 	};
	//
	// 	it('global - no local `before`', function (done) {
	// 		before(sampleGlobal, {}, _.cloneDeep(originalParams))
	// 		.then(function (params) {
	// 			assert.deepEqual(
	// 				params,
	// 				{
	// 					id: 'abc123',
	// 					notes: 'Hello'
	// 				}
	// 			);
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// 	it('global - non-returning local `before`', function (done) {
	// 		before(
	// 			sampleGlobal,
	// 			{ before: () => {} },
	// 			_.cloneDeep(originalParams)
	// 		)
	// 		.then(function (params) {
	// 			assert.deepEqual(
	// 				params,
	// 				{
	// 					id: 'abc123',
	// 					notes: 'Hello'
	// 				}
	// 			);
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// 	it('method - no global `before`', function (done) {
	// 		before(
	// 			{ _globalOptions: {} },
	// 			sampleMethodConfig,
	// 			_.cloneDeep(originalParams)
	// 		)
	// 		.then(function (params) {
	// 			assert.deepEqual(
	// 				params,
	// 				{
	// 					id: 'abc123',
	// 					notes: ' World'
	// 				}
	// 			);
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// 	it('method - non-returning global `before`', function (done) {
	// 		before(
	// 			{ _globalOptions: { before: () => {} } },
	// 			sampleMethodConfig,
	// 			_.cloneDeep(originalParams)
	// 		)
	// 		.then(function (params) {
	// 			assert.deepEqual(
	// 				params,
	// 				{
	// 					id: 'abc123',
	// 					notes: ' World'
	// 				}
	// 			);
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// 	it('both', function (done) {
	// 		before(
	// 			sampleGlobal,
	// 			sampleMethodConfig,
	// 			_.cloneDeep(originalParams)
	// 		)
	// 		.then(function (params) {
	// 			assert.deepEqual(
	// 				params,
	// 				{
	// 					id: 'abc123',
	// 					notes: 'Hello World'
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
	// 	const originalParams = {
	// 		id: 'abc123',
	// 		notes: ''
	// 	};
	//
	// 	before(
	// 		{
	// 			_globalOptions: {
	// 				before: function (params) {
	// 					return { //new object instead of same referebce object
	// 						...params,
	// 						notes: 'Hello'
	// 					};
	// 				}
	// 			}
	// 		},
	// 		{
	// 			before: function (params) {
	// 				if (!params.notes) {
	// 					throw new Error('notes does not exist in params');
	// 				}
	// 				assert(params.notes);
	// 			}
	// 		},
	// 		_.cloneDeep(originalParams)
	// 	)
	// 	.then(function (params) {
	// 		assert.deepEqual(
	// 			params,
	// 			{
	// 				id: 'abc123',
	// 				notes: 'Hello'
	// 			}
	// 		);
	// 	})
	// 	.then(done, done);
	//
	// });
	//
	// describe('should throw an error if params is modified but not returned in development mode', function () {
	//
	// 	const sampleMethodConfig = {
	// 		before: function (params) {
	// 			params.notes += ' World';
	// 		}
	// 	};
	//
	// 	const originalParams = {
	// 		id: 'abc123',
	// 		notes: ''
	// 	};
	//
	// 	handleDevFlagTest('global', function (done) {
	// 		before(
	// 			{
	// 				_globalOptions: {
	// 					before: function (params) {
	// 						params.notes = 'Hello';
	// 					}
	// 				}
	// 			},
	// 			{},
	// 			_.cloneDeep(originalParams)
	// 		)
	// 		.then(function (params) {
	// 			assert.deepEqual(params, originalParams);
	// 		})
	// 		.then(assert.fail)
	// 		.catch((modError) => {
	// 			assert.strictEqual(modError.message, 'Modification by reference is deprecated. `before` must return the modified object.');
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// 	handleDevFlagTest('method', function (done) {
	// 		before(
	// 			{ _globalOptions: {} },
	// 			sampleMethodConfig,
	// 			_.cloneDeep(originalParams)
	// 		)
	// 		.then(assert.fail)
	// 		.catch((modError) => {
	// 			assert.strictEqual(modError.message, 'Modification by reference is deprecated. `before` must return the modified object.');
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// 	handleDevFlagTest('ok global but invalid method', function (done) {
	// 		before(
	// 			{
	// 				_globalOptions: {
	// 					before: function (params) {
	// 						params.notes = 'Hello';
	// 						return params;
	// 					}
	// 				}
	// 			},
	// 			sampleMethodConfig,
	// 			_.cloneDeep(originalParams)
	// 		)
	// 		.then(assert.fail)
	// 		.catch((modError) => {
	// 			assert.strictEqual(modError.message, 'Modification by reference is deprecated. `before` must return the modified object.');
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// });
	//
	// describe('should not run global before when globals is false', function (done) {
	// 	const sampleGlobal = {
	// 		_globalOptions: {
	// 			before: function (params) {
	// 				params.notes = 'Hello';
	// 				return params;
	// 			}
	// 		}
	// 	};
	//
	// 	it('all globals false', function (done) {
	// 		before(
	// 			sampleGlobal,
	// 			{
	// 				globals: false,
	// 				before: function (params) {
	// 					params.notes += ' World';
	// 					return params;
	// 				}
	// 			},
	// 			{
	// 				id: 'abc123',
	// 				notes: ''
	// 			}
	// 		)
	// 		.then(function (params) {
	// 			assert.deepEqual(params, {
	// 				id: 'abc123',
	// 				notes: ' World'
	// 			});
	// 		})
	// 		.then(done, done);
	// 	});
	//
	// 	it('only before globals false', function (done) {
	// 		before(
	// 			sampleGlobal,
	// 			{
	// 				globals: {
	// 					before: false
	// 				},
	// 				before: function (params) {
	// 					params.notes += ' World';
	// 					return params;
	// 				}
	// 			},
	// 			{
	// 				id: 'abc123',
	// 				notes: ''
	// 			}
	// 		)
	// 		.then(function (params) {
	// 			assert.deepEqual(params, {
	// 				id: 'abc123',
	// 				notes: ' World'
	// 			});
	// 		})
	// 		.then(done, done);
	// 	});
	// });

});
