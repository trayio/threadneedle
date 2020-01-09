const assert = require('assert');
const _	= require('lodash');

const afterRequest = require('../../lib/processor/afterRequest');
const throwTest = require('../testUtils/throwTest');

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

	it('should execute global first, then method', async function () {

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
			undefined,
			(request) => { return (request.data += 'abc', request); },
			{
				data: 'xyz'
			}
		);

		assert.strictEqual(returnedBody.data, 'xyzabc');

	});

	it('should allow global to be a promise', async function () {

		const returnedBody = await afterRequest(
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

		assert.strictEqual(returnedBody.data, 'xyzabc');

	});

	it('should not execute method if not provided', async function () {

		const returnedBody = await afterRequest(
			(request) => { return (request.data += '123', request); },
			undefined,
			{
				data: 'xyz'
			}
		);

		assert.strictEqual(returnedBody.data, 'xyz123');

	});

	it('should allow method to be a promise', async function () {

		const returnedBody = await afterRequest(
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

		assert.strictEqual(returnedBody.data, 'xyz123');

	});

	it('should execute normally with both being async', async function () {

		const returnedBody = await afterRequest(
			(request) => {
				return new Promise((resolve, reject) => {
					resolve((request.data += 'abc', request));
				});
			},
			(request) => {
				return new Promise((resolve, reject) => {
					resolve((request.data += '123', request));
				});
			},
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

	it('should do nothing if neither global or method is provided', async function () {

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
		'should throw on global before method',
		afterRequest,
		[
			(request) => { return (request.data += '123', request); },
			(request) => { throw new Error('ERROR THROWN'); },
			{
				data: 'xyz'
			}
		],
		'ERROR THROWN'
	);

	throwTest(
		'should throw on method',
		afterRequest,
		[
			(request) => { throw new Error('ERROR THROWN'); },
			(request) => { return (request.data += 'abc', request); },
			{
				data: 'xyz'
			}
		],
		'ERROR THROWN'
	);

});
