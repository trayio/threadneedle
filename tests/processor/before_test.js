const assert	= require('assert');

const _	= require('lodash');

const before = require('../../lib/processor/before');
const throwTest = require('../testUtils/throwTest');

describe('processor.before', function () {

	it('before is a function', () => {
		assert(_.isFunction(before));
	});

	// it('before returns a promise', () => {
	// 	assert(when.isPromiseLike(
	// 		before(
	// 			() => {},
	// 			() => {},
	// 			{}
	// 		)
	// 	));
	// });

	it('before function executes global\'s before local', function (done) {

		before(
			(params) => { return (params.test -= 4, params); },
			(params) => { return (params.test /= 2, params); },
			{
				test: 10
			}
		)

		.then(function (value) {
			assert.strictEqual(value.test, 1);
			done();
		})

		.catch(done);

	});

	it('before function does not execute global if not provided ', function (done) {

		before(
			(params) => { return (params.test -= 4, params); },
			undefined,
			{
				test: 10
			}
		)

		.then(function (value) {
			assert.strictEqual(value.test, 6);
			done();
		})

		.catch(done);

	});

	it('before function does not execute global if not provided ', function (done) {

		before(
			(params) => { return (params.test -= 4, params); },
			undefined,
			{
				test: 10
			}
		)

		.then(function (value) {
			assert.strictEqual(value.test, 6);
			done();
		})

		.catch(done);

	});

	it('before function allows global to be a promise', function (done) {

		before(
			(params) => {
				return new Promise((resolve, reject) => {
					resolve((params.test -= 4, params));
				});
			},
			undefined,
			{
				test: 10
			}
		)

		.then(function (value) {
			assert.strictEqual(value.test, 6);
			done();
		})

		.catch(done);

	});

	it('before function does not execute local if not provided', function (done) {

		before(
			undefined,
			(params) => { return (params.test /= 2, params); },
			{
				test: 10
			}
		)

		.then(function (value) {
			assert.strictEqual(value.test, 5);
			done();
		})

		.catch(done);

	});

	it('before function allows local to be a promise', function (done) {

		before(
			undefined,
			(params) => {
				return new Promise((resolve, reject) => {
					resolve((params.test /= 2, params));
				});
			},
			{
				test: 10
			}
		)

		.then(function (value) {
			assert.strictEqual(value.test, 5);
			done();
		})

		.catch(done);

	});

	it('before function does nothing if neither global or local is provided', function (done) {

		before(
			undefined,
			undefined,
			{
				test: 10
			}
		)

		.then(function (value) {
			assert.strictEqual(value.test, 10);
			done();
		})

		.catch(done);

	});

	// it('should run normally with global first and then method', function (done) {
	// 	globalize.before.call(
	// 		{
	// 			_globalOptions: {
	// 				before: function (params) {
	// 					params.notes = 'Hello';
	// 					return params;
	// 				}
	// 			}
	// 		},
	// 		{
	// 			before: function (params) {
	// 				params.notes += ' World';
	// 				return params;
	// 			}
	// 		},
	// 		{
	// 			id: 'abc123'
	// 		}
	// 	)
	// 	.then(function (params) {
	// 		assert.deepEqual(params, {
	// 			id: 'abc123',
	// 			notes: 'Hello World'
	// 		});
	// 	})
	// 	.then(done, done);
	// });
	//
	// it('should run normally with global first and then method - new object', function (done) {
	// 	globalize.before.call(
	// 		{
	// 			_globalOptions: {
	// 				before: function (params) {
	// 					return {
	// 						...params,
	// 						notes: 'Hello'
	// 					};
	// 				}
	// 			}
	// 		},
	// 		{
	// 			before: function (params) {
	// 				if (!params.notes) {
	// 					throw new Error('notes does not exist');
	// 				}
	// 				return {
	// 					...params,
	// 					description: 'World'
	// 				};
	// 			}
	// 		},
	// 		{
	// 			id: 'abc123'
	// 		}
	// 	)
	// 	.then(function (params) {
	// 		assert.deepEqual(params, {
	// 			id: 'abc123',
	// 			notes: 'Hello',
	// 			description: 'World'
	// 		});
	// 	})
	// 	.then(done, done);
	// });
	//
	// it('should run async normally with global first and then method', function (done) {
	// 	globalize.before.call(
	// 		{
	// 			_globalOptions: {
	// 				before: function (params) {
	// 					params.notes = 'Hello';
	// 					return when.resolve(params);
	// 				}
	// 			}
	// 		},
	// 		{
	// 			before: function (params) {
	// 				params.notes += ' World';
	// 				return when.resolve(params);
	// 			}
	// 		},
	// 		{
	// 			id: 'abc123'
	// 		}
	// 	)
	// 	.then(function (params) {
	// 		assert.deepEqual(params, {
	// 			id: 'abc123',
	// 			notes: 'Hello World'
	// 		});
	// 	})
	// 	.then(done, done);
	// });
	//
	// it('should error when non-object is returned (except undefined)', function (done) {
	// 	globalize.before.call(
	// 		{
	// 			_globalOptions: {
	// 				before: function (params) {
	// 					return null;
	// 				}
	// 			}
	// 		},
	// 		{},
	// 		{
	// 			id: 'abc123'
	// 		}
	// 	)
	// 	.then(assert.fail)
	// 	.catch((returnError) => {
	// 		assert.strictEqual(returnError.message, '`before` must return an object.');
	// 	})
	// 	.then(done, done);
	// });
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
	// 		globalize.before.call(sampleGlobal, {}, _.cloneDeep(originalParams))
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
	// 		globalize.before.call(
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
	// 		globalize.before.call(
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
	// 		globalize.before.call(
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
	// 		globalize.before.call(
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
	// 	globalize.before.call(
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
	// 		globalize.before.call(
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
	// 		globalize.before.call(
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
	// 		globalize.before.call(
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
	// 		globalize.before.call(
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
	// 		globalize.before.call(
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
