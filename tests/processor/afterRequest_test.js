const assert = require('assert');
const _	= require('lodash');

const afterRequest = require('../../lib/processor/afterRequest');
const throwTest = require('../testUtils/throwTest');
const devFlagTest = require('../testUtils/devFlagTest');

/* eslint-disable no-unused-vars */
describe('processor.afterRequest', () => {

	//TODO: add tests to coreFlow tests to ensure globals flase is processed correctly

	it('should be a function', () => {
		assert(_.isFunction(afterRequest));
	});

	it('should return a promise', () => {
		const thenable = afterRequest(
			() => {},
			() => {},
			{},
			{},
			{
				body: {}
			}
		).then;
		assert(_.isFunction(thenable));
	});

	it('should execute global first, then local', async function () {

		const returnedBody = await afterRequest(
			(request) => { return (request.data += 'abc', request); },
			(request) => { return (request.data += '123', request); },
			{
				data: 'xyz'
			},
			{},
			{
				body: {
					data: 'xyz'
				}
			}
		);

		assert.strictEqual(returnedBody.data, 'xyz123abc');

	});

	it('should not execute global if not provided ', async function () {

		const returnedBody = await afterRequest(
			(request) => { return (request.data += 'abc', request); },
			undefined,
			{
				data: 'xyz'
			}
		);

		assert.strictEqual(returnedBody.data, 'xyzabc');

	});

	it('should allow global to be a promise', async function () {

		const returnedBody = await afterRequest(
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

		assert.strictEqual(returnedBody.data, 'xyzabc');

	});

	it('should not execute local if not provided', async function () {

		const returnedBody = await afterRequest(
			undefined,
			(request) => { return (request.data += '123', request); },
			{
				data: 'xyz'
			}
		);

		assert.strictEqual(returnedBody.data, 'xyz123');

	});

	it('should allow local to be a promise', async function () {

		const returnedBody = await afterRequest(
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

		assert.strictEqual(returnedBody.data, 'xyz123');

	});

	it('should do nothing if neither global or local is provided', async function () {

		const returnedBody = await afterRequest(
			undefined,
			undefined,
			{
				data: 'xyz'
			}
		);

		assert.strictEqual(returnedBody.data, 'xyz');

	});

	throwTest(
		'should throw on global before local',
		afterRequest,
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
		'should throw on local',
		afterRequest,
		[
			(request) => { return (request.data += 'abc', request); },
			(request) => { throw new Error('ERROR THROWN'); },
			{
				data: 'xyz'
			}
		],
		'ERROR THROWN'
	);

	//TODO

});


// describe('#afterSuccess', function () {
//
// 	it('should run the global before method when declared', function (done) {
// 		var sample = {
// 			_globalOptions: {
// 				afterSuccess: function (body) {
// 					body.success = true;
// 				}
// 			}
// 		};
//
// 		globalize.afterSuccess.call(sample, {}, {}).done(function (body) {
// 			assert.deepEqual(body, { success: true });
// 			done();
// 		});
// 	});
//
// 	it('should allow for a global promise async', function (done) {
// 		var sample = {
// 			_globalOptions: {
// 				afterSuccess: function (body) {
// 					return when.promise(function (resolve, reject) {
// 						body.success = true;
// 						resolve();
// 					});
// 				}
// 			}
// 		};
//
// 		globalize.afterSuccess.call(sample, {}, {}).done(function (body) {
// 			assert.deepEqual(body, { success: true });
// 			done();
// 		});
// 	});
//
// 	it('should call the global promise before the local one', function (done) {
// 		var calledFirst;
// 		var calls = 0;
//
// 		var sample = {
// 			_globalOptions: {
// 				afterSuccess: function (params) {
// 					if (!calledFirst) calledFirst = 'global';
// 					calls++;
// 				}
// 			}
// 		};
//
// 		globalize.afterSuccess.call(sample, {
// 			afterSuccess: function () {
// 				if (!calledFirst) calledFirst = 'local';
// 				calls++;
// 			}
// 		}, {}).done(function (params) {
// 			assert.equal(calledFirst, 'global');
// 			assert.equal(calls, 2);
// 			done();
// 		});
// 	});
//
// 	it('should not run the globals when globals is false', function (done) {
// 		var sample = {
// 			_globalOptions: {
// 				afterSuccess: function (body) {
// 					body.success = true;
// 				}
// 			}
// 		};
//
// 		globalize.afterSuccess.call(sample, {
// 			globals: false
// 		}, {}).done(function (body) {
// 			assert.deepEqual(body, {});
// 			//done();
// 		});
//
// 		globalize.afterSuccess.call(sample, {
// 			globals: {
// 				afterSuccess: false
// 			}
// 		}, {}).done(function (body) {
// 			assert.deepEqual(body, {});
// 			done();
// 		});
// 	});
//
// });
//
// describe('#afterFailure', function () {
//
// 	it('should run the global before method when declared', function (done) {
// 		var sample = {
// 			_globalOptions: {
// 				afterFailure: function (err) {
// 					err.code = 'oauth_refresh';
// 				}
// 			}
// 		};
//
// 		globalize.afterFailure.call(sample, {}, {}).done(function (err) {
// 			assert.deepEqual(err, { code: 'oauth_refresh' });
// 			done();
// 		});
// 	});
//
// 	it('should allow for a global promise async', function (done) {
// 		var sample = {
// 			_globalOptions: {
// 				afterFailure: function (err) {
// 					return when.promise(function (resolve, reject) {
// 						err.code = 'oauth_refresh';
// 						resolve();
// 					});
// 				}
// 			}
// 		};
//
// 		globalize.afterFailure.call(sample, {}, {}).done(function (err) {
// 			assert.deepEqual(err, { code: 'oauth_refresh' });
// 			done();
// 		});
// 	});
//
// 	it('should call the global promise before the local one', function (done) {
// 		var calledFirst;
// 		var calls = 0;
//
// 		var sample = {
// 			_globalOptions: {
// 				afterFailure: function () {
// 					if (!calledFirst) calledFirst = 'global';
// 					calls++;
// 				}
// 			}
// 		};
//
// 		globalize.afterFailure.call(sample, {
// 			afterFailure: function () {
// 				if (!calledFirst) calledFirst = 'local';
// 				calls++;
// 			}
// 		}, {}).done(function () {
// 			assert.equal(calledFirst, 'global');
// 			assert.equal(calls, 2);
// 			done();
// 		});
// 	});
//
// 	it('should not run the global when globals is false', function (done) {
// 		var sample = {
// 			_globalOptions: {
// 				afterFailure: function (err) {
// 					err.code = 'oauth_refresh';
// 				}
// 			}
// 		};
//
// 		globalize.afterFailure.call(sample, {
// 			globals: false
// 		}, {}).done(function (err) {
// 			assert.deepEqual(err, {});
// 			//done();
// 		});
//
// 		globalize.afterFailure.call(sample, {
// 			globals: {
// 				afterFailure: false
// 			}
// 		}, {}).done(function (err) {
// 			assert.deepEqual(err, {});
// 			done();
// 		});
// 	});
//
//
// });
