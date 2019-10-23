const assert = require('assert');
const fs = require('fs');

const _ = require('lodash');
const when = require('when');
const express = require('express');

const randString = require('mout/random/randString');
const globalize = require('../lib/addMethod/globalize');
const ThreadNeedle = require('../');

const SOAPServer = require('./soapServer');

function promiseFailFunc (done) {
	return function (err) {
		//eslint-disable-next-line no-console
		console.log(err);
		assert.fail(err);
		done(err);
	};
}

function asyncTest (message, testFunction) {
	it(message, async () => {
		try {
			await testFunction();
		} catch (testError) {
			//eslint-disable-next-line no-console
			console.log(testError);
			throw testError;
		}
	});
}

const REGONLINE_TOKEN = 'abc1234';

describe('#addMethodSOAP', function () {

	let soapServer;
	before((done) => {
		soapServer = new SOAPServer(8000);

		soapServer.startServer((startError) => {
			if (startError) {
				throw startError;
			}
			done();
		});
	});

	describe('Running', function () {
		this.timeout(30000);
		let threadneedle;

		before(function () {
			threadneedle = new ThreadNeedle();
			threadneedle.global({

				type: 'SOAP',

				wsdl: 'http://localhost:8000/default.asmx?WSDL',

				options: {
					headers: [
						{
							value: {
								TokenHeader: {
									APIToken: REGONLINE_TOKEN
								}
							},
							xmlns: 'http://www.regonline.com/api',
						}
					]
				},

				data: {}


			});

		});

		it('should error if wsdl is not provided (or not a string)', function (done) {

			const privateThreadneedle = new ThreadNeedle();

			privateThreadneedle.global({

				type: 'SOAP',

				options: {
					headers: [
						{
							value: {
								TokenHeader: {
									APIToken: REGONLINE_TOKEN
								}
							},
							xmlns: 'http://www.regonline.com/api',
						}
					]
				},

				data: {}


			});

			when(privateThreadneedle.addMethod(
				'list_events',
				{
					method: 'GetEvents',

					data: {
						orderBy: 'ID DESC',
					}
				}
			))

			.then(
				function () {

					when(privateThreadneedle['list_events']({}))

					.then(
						promiseFailFunc(done),
						function (err) {
							assert.strictEqual(err, '`wsdl` field (string) must be provided to create a client instance.');
							done();
						}
					);

				},
				promiseFailFunc(done)
			);

		});


		it('should be able to add a standard SOAP method', function (done) {

			when(threadneedle.addMethod(
				'list_events_test',
				{
					method: 'GetEvents',

					data: {
						orderBy: 'ID DESC',
					}
				}
			))

			.then(
				function () {
					assert(_.isFunction(threadneedle['list_events_test']));
					done();
				},
				promiseFailFunc(done)
			);

		});

		asyncTest('should be able to execute a standard SOAP method', async function () {

			await threadneedle.addMethod(
				'list_events',
				{
					method: 'GetEvents',

					data: {
						orderBy: 'ID DESC',
					}
				}
			);

			const results = await threadneedle['list_events']({});

			assert.deepEqual(results.headers, {});
			assert(results.body['GetEventsResult']['Success']);

		});


		it('should substitute to the url and data with a basic example', function (done) {

			when(threadneedle.addMethod(
				'list_events2',
				{
					method: 'Get{{event_type}}',

					data: {
						orderBy: '{{order_by}}',
					}
				}
			))

			.then(
				function (result) {

					when(threadneedle['list_events2']({
						event_type: 'Events',
						order_by: 'ID DESC'
					}))

					.then(function (results) {
						assert(results.body['GetEventsResult']['Success']);
					})

					.then(done, promiseFailFunc(done));

				},
				promiseFailFunc(done)
			);

		});


		it('should substitute to the options with a basic example', function (done) {

			const privateThreadneedle = new ThreadNeedle();

			privateThreadneedle.global({

				type: 'SOAP',

				wsdl: 'http://localhost:8000/default.asmx?WSDL',

				options: {
					headers: [
						{
							value: {
								TokenHeader: {
									APIToken: '{{access_token}}'
								}
							},
							xmlns: 'http://www.regonline.com/api',
						}
					]
				},

				data: {}


			});

			when(privateThreadneedle.addMethod(
				'list_events',
				{
					method: 'GetEvents',

					data: {
						orderBy: 'ID DESC',
					}
				}
			))

			.then(
				function () {

					when(privateThreadneedle['list_events']({
						access_token: REGONLINE_TOKEN
					}))

					.then(function (results) {
						assert.deepEqual(results.headers, {});
						assert(results.body['GetEventsResult']['Success']);
					})

					.then(done, promiseFailFunc(done));

				},
				promiseFailFunc(done)
			);

		});


		it('should reject if expects function returns error', function (done) {
			this.timeout(10000);

			when(threadneedle.addMethod(
				'list_events3',
				{
					method: 'GetEvents',

					data: {
						orderBy: 'ID DESC',
					},

					expects: function (results) {
						if (results.body['GetEventsResult']['Success'] === true) {
							return 'Test Error';
						}
					}
				}
			))

			.then(
				function (result) {

					when(threadneedle['list_events3']({}))

					.then(
						promiseFailFunc(done),
						function (err) {
							assert.deepEqual(err.headers, {});
							assert(err.body.message === 'Test Error');
							done();
						}
					);

				},
				promiseFailFunc(done)
			);

		});

		it('should reject if notExpects function returns error', function (done) {

			when(threadneedle.addMethod(
				'list_events4',
				{
					method: 'GetEvents',

					data: {
						orderBy: 'ID DESC',
					},

					notExpects: function (results) {
						if (results.body['GetEventsResult']['Success'] === true) {
							return 'Test Error';
						}
					}
				}
			))

			.then(
				function (result) {

					when(threadneedle['list_events4']({}))

					.then(
						promiseFailFunc(done),
						function (err) {
							assert(err.body.message === 'Test Error');
							done();
						}
					);

				},
				promiseFailFunc(done)
			);

		});


	});

	describe('Ad-hoc', function () {

		it('should be fine with allowing the method config to be a function', function (done) {

			const threadneedle = new ThreadNeedle();
			threadneedle.global({ type: 'soap' });

			threadneedle.addMethod(
				'myCustomMethod',
				function (params) {
					return params.name;
				}
			);

			threadneedle.myCustomMethod({ name: 'Chris' })

			.then(
				function (val) {
					assert.deepEqual(val.body, 'Chris');
					done();
				},
				function (err) {
					assert.fail(err);
				}
			);

		});

		function functionModel (params) {
			return (
				params.passFlag ?
				when.resolve({ success: true }) :
				when.reject(new Error('functionModel Error'))
			);
		}

		function afterHeadersFunction (error, params, body, res) {
			if (params.ahFlag) {
				return {
					gotError: !!error
				};
			} else {
				throw new Error('afterHeaders Error');
			}
		}

		it('Should place `afterHeaders` object in header if function model resolve', function (done) {
			const name = randString(10);
			const threadneedle = new ThreadNeedle();
			threadneedle.global({ type: 'soap' });
			threadneedle.addMethod(name, functionModel, afterHeadersFunction);

			threadneedle[name]({
				passFlag: true,
				ahFlag: true
			})
			.then(
				function (result) {
					assert.deepEqual(result.headers.gotError, false);
					assert.deepEqual(result.body.success, true);
					done();
				},
				function (error) {
					assert.fail('Wrong clause - failing');
					assert.fail(error);
					done();
				}
			);
		});

		it('Should place `afterHeaders` error in body if function model resolve', function (done) {
			const name = randString(10);
			const threadneedle = new ThreadNeedle();
			threadneedle.global({ type: 'soap' });
			threadneedle.addMethod(name, functionModel, afterHeadersFunction);

			threadneedle[name]({
				passFlag: true,
				ahFlag: false
			})
			.then(
				function (result) {
					assert.fail('Wrong clause - succeeding');
					assert.fail(result);
					done();
				},
				function (result) {
					assert.deepEqual(result.headers, {});
					assert.deepEqual(result.body.message, 'afterHeaders Error');
					done();
				}
			);
		});

		it('Should place `afterHeaders` object in header if function model reject', function (done) {
			const name = randString(10);
			const threadneedle = new ThreadNeedle();
			threadneedle.global({ type: 'soap' });
			threadneedle.addMethod(name, functionModel, afterHeadersFunction);

			threadneedle[name]({
				passFlag: false,
				ahFlag: true
			})
			.then(
				function (result) {
					assert.fail('Wrong clause - succeeding');
					assert.fail(result);
					done();
				},
				function (result) {
					assert.deepEqual(result.headers.gotError, true);
					assert.deepEqual(result.body.message, 'functionModel Error');
					done();
				}
			);
		});

		it('Should place `afterHeaders` error in body if function model reject', function (done) {
			const name = randString(10);
			const threadneedle = new ThreadNeedle();
			threadneedle.global({ type: 'soap' });
			threadneedle.addMethod(name, functionModel, afterHeadersFunction);

			threadneedle[name]({
				passFlag: false,
				ahFlag: false
			})
			.then(
				function (result) {
					assert.fail('Wrong clause - succeeding');
					assert.fail(result);
					done();
				},
				function (result) {
					assert.deepEqual(result.headers, {});
					assert.deepEqual(result.body.message, 'afterHeaders Error');
					done();
				}
			);
		});

		it('Should throw error if `afterHeaders` is not a function', function (done) {
			const name = randString(10);
			const threadneedle = new ThreadNeedle();
			threadneedle.global({ type: 'soap' });
			threadneedle.addMethod(name, functionModel, {});

			threadneedle[name]({
				passFlag: true,
				ahFlag: true
			})
			.then(
				function (result) {
					assert.fail(result);
					done();
				},
				function (ahError) {
					assert.strictEqual(ahError.message, 'afterHeaders must be a function.');
					done();
				}
			);
		});


	});

	describe('Ad-hoc from REST mode', function () {
		this.timeout(10000);

		it('should be fine with allowing a single SOAP method config from REST mode', function (done) {

			const threadneedle = new ThreadNeedle();

			threadneedle.addMethod(
				'myCustomMethod',
				function (params) {
					return params.name;
				}
			);

			threadneedle.addMethod(
				'mySOAPMethod',
				{

					type: 'SOAP',

					wsdl: 'http://localhost:8000/default.asmx?WSDL',

					options: {
						headers: [
							{
								value: {
									TokenHeader: {
										APIToken: REGONLINE_TOKEN
									}
								},
								xmlns: 'http://www.regonline.com/api',
							}
						]
					},

					method: 'GetEvents',

					data: {
						orderBy: 'ID DESC',
					},

					afterHeaders: function () {
						return {
							success: true
						};
					}

				}
			);

			threadneedle['mySOAPMethod']({})

			.then(
				function (val) {
					assert.deepEqual(val.headers.success, true);
					assert(val.body['GetEventsResult']['Success']);
					done();
				},
				function (err) {
					assert.fail(err);
				}
			);

		});

	});

	after((done) => {
		soapServer.stopServer((closeError) => {
			if (closeError) {
				throw closeError;
			}
			done();
		});
	});

});
