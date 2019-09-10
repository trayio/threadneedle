const assert = require('assert');

const _ = require('lodash');
const when = require('when');

const globalize    = require('../lib/addMethod/globalize');

let devMode = process.env.NODE_ENV === 'development';
function handleDevFlagTest (testMessage, testFunction) {
	it(testMessage, function (done) {
		if (devMode) {
			testFunction(done);
		} else {
			process.env.NODE_ENV = 'development';
			testFunction((...doneArgs) => {
				delete process.env.NODE_ENV;
				done(...doneArgs);
			});
		}
	});
}

describe('#globalize', function () {

	describe('#url', function () {

		it('should add the global baseUrl on the front unless it starts with http(s)://', function () {
			var sample = {
				_globalOptions: {
					baseUrl: 'http://mydomain.com'
				}
			};

			assert.strictEqual(
				globalize.baseUrl.call(sample, { url: '/mypath' }, {}),
				'http://mydomain.com/mypath'
			);

			assert.strictEqual(
				globalize.baseUrl.call(sample, { url: 'http://yourdomain.com/mypath' }, {}),
				'http://yourdomain.com/mypath'
			);

			assert.strictEqual(
				globalize.baseUrl.call(sample, { url: 'https://yourdomain.com/mypath' }, {}),
				'https://yourdomain.com/mypath'
			);
		});

		it('should substitute parameters to string urls', function () {
			var sample = {
				_globalOptions: {
					baseUrl: 'http://{{dc}}.mydomain.com'
				}
			};

			assert.strictEqual(
				globalize.baseUrl.call(sample, { url: '/mypath/{{id}}' }, {
					dc: 'us5',
					id: '123'
				}),
				'http://us5.mydomain.com/mypath/123'
			);
		});

		it('should substitute array parameters as comma separated', function () {
			var sample = {
				_globalOptions: {
					baseUrl: 'http://{{dc}}.mydomain.com'
				}
			};

			assert.strictEqual(
				globalize.baseUrl.call(sample, { url: '/mypath/{{id}}?opt_fields={{fields}}' }, {
					dc: 'us5',
					id: '123',
					fields: [ 'id', 'name', 'is_organization' ]
				}),
				'http://us5.mydomain.com/mypath/123?opt_fields=id,name,is_organization'
			);
		});

		it('should substitute parameters to function urls', function () {
			var sample = {
				_globalOptions: {
					baseUrl: function (params) {
						return 'http://'+params.dc+'.mydomain.com';
					}
				}
			};

			assert.strictEqual(
				globalize.baseUrl.call(sample, {
					url: function (params) {
						return '/mypath/' + params.id;
					}
				}, {
					dc: 'us5',
					id: '123'
				}),
				'http://us5.mydomain.com/mypath/123'
			);
		});

		it('should not run the global when globals is false', function () {
			var sample = {
				_globalOptions: {
					baseUrl: 'http://mydomain.com'
				}
			};

			assert.strictEqual(
				globalize.baseUrl.call(sample, { url: '/mypath', globals: false }, {}),
				'/mypath'
			);

			assert.strictEqual(
				globalize.baseUrl.call(sample, { url: '/mypath', globals: { baseUrl: false } }, {}),
				'/mypath'
			);
		});

		describe('should use baseUrl in global configuration instead of url; throw error in development mode', function () {

			it('uses baseUrl', function () {
				assert.strictEqual(
					globalize.baseUrl.call({
						_globalOptions: {
							baseUrl: 'http://mydomain.com'
						}
					}, { url: '/mypath' }, {}),
					'http://mydomain.com/mypath'
				);
			});

			it('uses url in global configuration (console only)', function () {
				assert.strictEqual(
					globalize.baseUrl.call({
						_globalOptions: {
							url: 'http://mydomain.com'
						}
					}, { url: '/mypath' }, {}),
					'http://mydomain.com/mypath'
				);
			});

			handleDevFlagTest('uses url in global configuration and errors (development mode)', function (done) {
				try {
					assert.strictEqual(
						globalize.baseUrl.call({
							_globalOptions: {
								url: 'http://mydomain.com'
							}
						}, { url: '/mypath' }, {}),
						'http://mydomain.com/mypath'
					);
					done(assert.fail('Error expected'));
				} catch (urlError) {
					assert.strictEqual(urlError.message, '`url` in global configuration is deprecated. Use `baseUrl` instead.');
					done();
				}
			});
		});

	});


	describe('#object', function () {

		it('should globalize to an object on a shallow level', function () {
			var sample = {
				_globalOptions: {
					data: {
						id: '123',
						name: 'Chris'
					}
				}
			};

			assert.deepEqual(globalize.object.call(sample, 'data', {
				data: {
					age: 25,
					height: 180
				}
			}, {}), {
				id: '123',
				name: 'Chris',
				age: 25,
				height: 180
			});
		});

		it('should globalize to an object on a deep level', function () {
			var sample = {
				_globalOptions: {
					data: {
						id: '123',
						name: 'Chris',
						height: {
							m: 1.9
						}
					}
				}
			};

			assert.deepEqual(globalize.object.call(sample, 'data', {
				data: {
					age: 25,
					height: {
						cm: 180,
						m: 1.8
					}
				}
			}, {}), {
				id: '123',
				name: 'Chris',
				age: 25,
				height: {
					cm: 180,
					m: 1.8
				}
			});
		});

		it('should substitute to an global object on a deep level', function () {
			var sample = {
				_globalOptions: {
					data: {
						id: '123',
						firstName: '{{firstName}}',
						lastName: '{{lastName}}'
					}
				}
			};

			assert.deepEqual(globalize.object.call(sample, 'data', {
				data: {
					name: '{{name}}'
				}
			}, {
				name: 'Chris Houghton',
				firstName: 'Chris',
				lastName: 'Houghton'
			}), {
				id: '123',
				name: 'Chris Houghton',
				firstName: 'Chris',
				lastName: 'Houghton'
			});
		});

		it('should return local string if data is a string', function () {
			var sample = {
				_globalOptions: {
					data: {
						id: '123',
						name: 'Chris'
					}
				}
			};

			assert.deepEqual(
				globalize.object.call(sample, 'data', {
					globals: false,
					data: 'Lorem ipsum'
				}, {}),
				'Lorem ipsum'
			);


		});

		it('should not globalize when globals is false', function () {
			var sample = {
				_globalOptions: {
					data: {
						id: '123',
						name: 'Chris'
					}
				}
			};

			assert.deepEqual(globalize.object.call(sample, 'data', {
				globals: false,
				data: {
					age: 25,
					height: 180
				}
			}, {}), {
				age: 25,
				height: 180
			});

			assert.deepEqual(globalize.object.call(sample, 'data', {
				globals: {
					data: false
				},
				data: {
					age: 25,
					height: 180
				}
			}, {}), {
				age: 25,
				height: 180
			});
		});


	});


	describe('#before', function () {

		it('should run normally with global first and then method', function (done) {
			globalize.before.call(
				{
					_globalOptions: {
						before: function (params) {
							params.notes = 'Hello';
							return params;
						}
					}
				},
				{
					before: function (params) {
						params.notes += ' World';
						return params;
					}
				},
				{
					id: 'abc123'
				}
			)
			.then(function (params) {
				assert.deepEqual(params, {
					id: 'abc123',
					notes: 'Hello World'
				});
			})
			.then(done, done);
		});

		it('should run async normally with global first and then method', function (done) {
			globalize.before.call(
				{
					_globalOptions: {
						before: function (params) {
							params.notes = 'Hello';
							return when.resolve(params);
						}
					}
				},
				{
					before: function (params) {
						params.notes += ' World';
						return when.resolve(params);
					}
				},
				{
					id: 'abc123'
				}
			)
			.then(function (params) {
				assert.deepEqual(params, {
					id: 'abc123',
					notes: 'Hello World'
				});
			})
			.then(done, done);
		});

		it('should error when non-object is returned (except undefined)', function (done) {
			globalize.before.call(
				{
					_globalOptions: {
						before: function (params) {
							return null;
						}
					}
				},
				{},
				{
					id: 'abc123'
				}
			)
			.then(assert.fail)
			.catch((returnError) => {
				assert.strictEqual(returnError.message, '`before` must return an object.');
			})
			.then(done, done);
		});

		describe('should use original params if modified but not returned (and console warn)', function () {

			const sampleGlobal = {
				_globalOptions: {
					before: function (params) {
						params.notes = 'Hello';
					}
				}
			};

			const sampleMethodConfig = {
				before: function (params) {
					params.notes += ' World';
				}
			};

			const originalParams = {
				id: 'abc123',
				notes: ''
			};

			it('global', function (done) {
				globalize.before.call(sampleGlobal, {}, _.cloneDeep(originalParams))
				.then(function (params) {
					assert.deepEqual(params, originalParams);
				})
				.then(done, done);
			});

			it('method', function (done) {
				globalize.before.call(
					{ _globalOptions: {} },
					sampleMethodConfig,
					_.cloneDeep(originalParams)
				)
				.then(function (params) {
					assert.deepEqual(params, originalParams);
				})
				.then(done, done);
			});

			it('both', function (done) {
				globalize.before.call(
					sampleGlobal,
					sampleMethodConfig,
					_.cloneDeep(originalParams)
				)
				.then(function (params) {
					assert.deepEqual(params, originalParams);
				})
				.then(done, done);
			});

		});

		describe('should throw an error if params is modified but not returned in development mode', function () {

			const sampleMethodConfig = {
				before: function (params) {
					params.notes += ' World';
				}
			};

			const originalParams = {
				id: 'abc123',
				notes: ''
			};

			handleDevFlagTest('global', function (done) {
				globalize.before.call(
					{
						_globalOptions: {
							before: function (params) {
								params.notes = 'Hello';
							}
						}
					},
					{},
					_.cloneDeep(originalParams)
				)
				.then(function (params) {
					assert.deepEqual(params, originalParams);
				})
				.then(assert.fail)
				.catch((modError) => {
					assert.strictEqual(modError.message, 'Modification by reference is deprecated. `before` must return the modified object.');
				})
				.then(done, done);
			});

			handleDevFlagTest('method', function (done) {
				globalize.before.call(
					{ _globalOptions: {} },
					sampleMethodConfig,
					_.cloneDeep(originalParams)
				)
				.then(assert.fail)
				.catch((modError) => {
					assert.strictEqual(modError.message, 'Modification by reference is deprecated. `before` must return the modified object.');
				})
				.then(done, done);
			});

			handleDevFlagTest('ok global but invalid method', function (done) {
				globalize.before.call(
					{
						_globalOptions: {
							before: function (params) {
								params.notes = 'Hello';
								return params;
							}
						}
					},
					sampleMethodConfig,
					_.cloneDeep(originalParams)
				)
				.then(assert.fail)
				.catch((modError) => {
					assert.strictEqual(modError.message, 'Modification by reference is deprecated. `before` must return the modified object.');
				})
				.then(done, done);
			});

		});

		describe('should not run global before when globals is false', function (done) {
			const sampleGlobal = {
				_globalOptions: {
					before: function (params) {
						params.notes = 'Hello';
						return params;
					}
				}
			};

			it('all globals false', function (done) {
				globalize.before.call(
					sampleGlobal,
					{
						globals: false,
						before: function (params) {
							params.notes += ' World';
							return params;
						}
					},
					{
						id: 'abc123',
						notes: ''
					}
				)
				.then(function (params) {
					assert.deepEqual(params, {
						id: 'abc123',
						notes: ' World'
					});
				})
				.then(done, done);
			});

			it('only before globals false', function (done) {
				globalize.before.call(
					sampleGlobal,
					{
						globals: {
							before: false
						},
						before: function (params) {
							params.notes += ' World';
							return params;
						}
					},
					{
						id: 'abc123',
						notes: ''
					}
				)
				.then(function (params) {
					assert.deepEqual(params, {
						id: 'abc123',
						notes: ' World'
					});
				})
				.then(done, done);
			});
		});

	});

	describe('#beforeRequest', function () {

		it('should run normally with global first and then method', function (done) {
			const sampleGlobal = {
				_globalOptions: {
					beforeRequest: function (request) {
						request.url += '?hello=world';
						return request;
					}
				}
			};

			const sampleMethodConfig = {
				beforeRequest: function (request) {
					request.url += '&test=123';
					return request;
				}
			};

			globalize.beforeRequest.call(
				sampleGlobal,
				sampleMethodConfig,
				{
					method: 'get',
					url: 'test.com'
				}
			)
			.then(function (request) {
				assert.deepEqual(
					request,
					{
						method: 'get',
						url: 'test.com?hello=world&test=123'
					}
				);
			})
			.then(done, done);
		});

		it('should run async normally with  global first and then method', function (done) {
			const sampleGlobal = {
				_globalOptions: {
					beforeRequest: function (request) {
						request.url += '?hello=world';
						return when.resolve(request);
					}
				}
			};

			const sampleMethodConfig = {
				beforeRequest: function (request) {
					request.url += '&test=123';
					return when.resolve(request);
				}
			};

			globalize.beforeRequest.call(
				sampleGlobal,
				sampleMethodConfig,
				{
					method: 'get',
					url: 'test.com'
				}
			)
			.then(function (request) {
				assert.deepEqual(
					request,
					{
						method: 'get',
						url: 'test.com?hello=world&test=123'
					}
				);
			})
			.then(done, done);
		});

		it('should error when non-object is returned (except undefined)', function (done) {
			globalize.beforeRequest.call(
				{
					_globalOptions: {
						beforeRequest: function (request) {
							return null;
						}
					}
				},
				{},
				{
					method: 'get',
					url: 'test.com'
				}
			)
			.then(assert.fail)
			.catch((returnError) => {
				assert.strictEqual(returnError.message, '`beforeRequest` must return an object.');
			})
			.then(done, done);
		});

		describe('should use original request if modified but not returned (and console warn)', function () {

			const sampleGlobal = {
				_globalOptions: {
					beforeRequest: function (request) {
						request.url += '?hello=world';
					}
				}
			};

			const sampleMethodConfig = {
				beforeRequest: function (request) {
					request.url += '&test=123';
				}
			};

			const originalRequest = {
				method: 'get',
				url: 'test.com'
			};

			it('global', function (done) {
				globalize.beforeRequest.call(sampleGlobal, {}, _.cloneDeep(originalRequest))
				.then(function (request) {
					assert.deepEqual(request, originalRequest);
				})
				.then(done, done);
			});

			it('method', function (done) {
				globalize.beforeRequest.call(
					{ _globalOptions: {} },
					sampleMethodConfig,
					_.cloneDeep(originalRequest)
				)
				.then(function (request) {
					assert.deepEqual(request, originalRequest);
				})
				.then(done, done);
			});

			it('both', function (done) {
				globalize.beforeRequest.call(
					sampleGlobal,
					sampleMethodConfig,
					_.cloneDeep(originalRequest)
				)
				.then(function (request) {
					assert.deepEqual(request, originalRequest);
				})
				.then(done, done);
			});

		});

		describe('should throw an error if request is modified but not returned in development mode', function () {

			const sampleMethodConfig = {
				beforeRequest: function (request) {
					request.url += '&test=123';
				}
			};

			const originalRequest = {
				method: 'get',
				url: 'test.com'
			};

			handleDevFlagTest('global', function (done) {
				globalize.beforeRequest.call(
					{
						_globalOptions: {
							beforeRequest: function (request) {
								request.url += '?hello=world';
							}
						}
					},
					{},
					_.cloneDeep(originalRequest)
				)
				.then(assert.fail)
				.catch((modError) => {
					assert.strictEqual(modError.message, 'Modification by reference is deprecated. `beforeRequest` must return the modified object.');
				})
				.then(done, done);
			});

			handleDevFlagTest('method', function (done) {
				globalize.beforeRequest.call(
					{ _globalOptions: {} },
					sampleMethodConfig,
					_.cloneDeep(originalRequest)
				)
				.then(assert.fail)
				.catch((modError) => {
					assert.strictEqual(modError.message, 'Modification by reference is deprecated. `beforeRequest` must return the modified object.');
				})
				.then(done, done);
			});

			handleDevFlagTest('ok global but invalid method', function (done) {
				globalize.beforeRequest.call(
					{
						_globalOptions: {
							beforeRequest: function (request) {
								request.url += '?hello=world';
								return request;
							}
						}
					},
					sampleMethodConfig,
					_.cloneDeep(originalRequest)
				)
				.then(assert.fail)
				.catch((modError) => {
					assert.strictEqual(modError.message, 'Modification by reference is deprecated. `beforeRequest` must return the modified object.');
				})
				.then(done, done);
			});

		});

		describe('should not run global before when globals is false', function () {
			const sampleGlobal = {
				_globalOptions: {
					beforeRequest: function (request) {
						request.url += '?hello=world';
						return request;
					}
				}
			};

			const originalRequest = {
				method: 'get',
				url: 'test.com'
			};

			it('all globals false', function (done) {
				const sampleMethodConfig = {
					globals: false,
					beforeRequest: function (request) {
						request.url += '&test=123';
						return request;
					}
				};
				globalize.beforeRequest.call(
					sampleGlobal,
					sampleMethodConfig,
					_.cloneDeep(originalRequest)
				)
				.then(function (request) {
					assert.deepEqual(request, {
						method: 'get',
						url: 'test.com&test=123'
					});
				})
				.then(done, done);
			});

			it('only beforeRequest globals false', function (done) {
				const sampleMethodConfig = {
					globals: {
						beforeRequest: false
					},
					beforeRequest: function (request) {
						request.url += '&test=123';
						return request;
					}
				};
				globalize.beforeRequest.call(
					sampleGlobal,
					sampleMethodConfig,
					_.cloneDeep(originalRequest)
				)
				.then(function (request) {
					assert.deepEqual(request, {
						method: 'get',
						url: 'test.com&test=123'
					});
				})
				.then(done, done);
			});


		});

	});


	describe('#expects', function () {

		it('should set the expects object when specified in global', function () {
			var sample = {
				_globalOptions: {
					expects: 200
				}
			};
			assert.deepEqual(globalize.expects.call(sample, {}), [{ statusCode: [200] }]);

			var sample2 = {
				_globalOptions: {
					expects: {
						statusCode: [ 200, 201 ],
						body: 'chris'
					}
				}
			};
			assert.deepEqual(globalize.expects.call(sample2, {}), [
				{
					statusCode: [ 200, 201 ],
					body: ['chris']
				}
			]);
		});

		it('should be overridden by the local config', function () {
			var sample = {
				_globalOptions: {
					expects: 200
				}
			};
			assert.deepEqual(globalize.expects.call(sample, {
				expects: {
					statusCode: 201
				}
			}), [
				{
					statusCode: [201]
				}
			]);

			assert.deepEqual(globalize.expects.call(sample, {
				expects: 202
			}), [
				{
					statusCode: [202]
				}
			]);
		});

		it('should not merge when there are functions on the global or local level', function () {
			var sample = {
				_globalOptions: {
					expects: function () {
						return 'Bad things';
					}
				}
			};
			assert.strictEqual(globalize.expects.call(sample, {
				expects: {
					body: 'steve'
				}
			}).length, 2);

			var sample2 = {
				_globalOptions: {
					expects: function () {
						return 'Bad things';
					}
				}
			};
			assert.strictEqual(globalize.expects.call(sample2, {
				expects: function () {
					return 'Locally bad things';
				}
			}).length, 2);

			var sample3 = {
				_globalOptions: {
					notExpects: [200]
				}
			};
			assert.strictEqual(globalize.expects.call(sample3, {
				expects: function () {
					return 'Locally bad things';
				}
			}).length, 2);
		});

		it('should not run global when globals is false', function () {
			var sample = {
				_globalOptions: {
					expects: 200
				}
			};
			assert.deepEqual(globalize.expects.call(sample, {}), [{ statusCode: [200] }]);

			var sample2 = {
				_globalOptions: {
					expects: {
						statusCode: [ 200, 201 ],
						body: 'chris'
					}
				}
			};
			assert.deepEqual(globalize.expects.call(sample2, {
				globals: false
			}), [{}]);
		});

		it('should not run global when globals.expects is false', function () {
			var sample = {
				_globalOptions: {
					expects: 200
				}
			};
			assert.deepEqual(globalize.expects.call(sample, {}), [{ statusCode: [200] }]);

			var sample2 = {
				_globalOptions: {
					expects: {
						statusCode: [ 200, 201 ],
						body: 'chris'
					}
				}
			};
			assert.deepEqual(globalize.expects.call(sample2, {
				globals: {
					expects: false
				}
			}), [{}]);
		});

	});

	describe('#notExpects', function () {

		it('should set the expects object when specified in global', function () {
			var sample = {
				_globalOptions: {
					notExpects: 200
				}
			};
			assert.deepEqual(globalize.notExpects.call(sample, {}), [{ statusCode: [200] }]);

			var sample2 = {
				_globalOptions: {
					notExpects: {
						statusCode: [ 200, 201 ],
						body: 'chris'
					}
				}
			};
			assert.deepEqual(globalize.notExpects.call(sample2, {}), [
				{
					statusCode: [ 200, 201 ],
					body: ['chris']
				}
			]);
		});

		it('should be overridden by the local config', function () {
			var sample = {
				_globalOptions: {
					notExpects: 200
				}
			};
			assert.deepEqual(globalize.notExpects.call(sample, {
				notExpects: {
					statusCode: 201
				}
			}), [
				{
					statusCode: [201]
				}
			]);

			assert.deepEqual(globalize.notExpects.call(sample, {
				notExpects: 202
			}), [
				{
					statusCode: [202]
				}
			]);
		});


		it('should not set the notExpects object when false is specified in globals', function () {
			var sample = {
				_globalOptions: {
					notExpects: {
						statusCode: [ 200, 201 ],
						body: 'chris'
					}
				}
			};

			assert.deepEqual(globalize.notExpects.call(sample, {
				notExpects: {
					body: 'steve'
				},
				globals: false
			}), [
				{
					body: ['steve']
				}
			]);

			assert.deepEqual(globalize.notExpects.call(sample, {
				notExpects: {
					body: 'steve'
				},
				globals: {
					notExpects: false
				}
			}), [
				{
					body: ['steve']
				}
			]);
		});

		it('should not merge when there are functions on the global or local level', function () {
			var sample = {
				_globalOptions: {
					notExpects: function () {
						return 'Bad things';
					}
				}
			};
			assert.strictEqual(globalize.notExpects.call(sample, {
				notExpects: {
					body: 'steve'
				}
			}).length, 2);

			var sample2 = {
				_globalOptions: {
					notExpects: function () {
						return 'Bad things';
					}
				}
			};
			assert.strictEqual(globalize.notExpects.call(sample2, {
				notExpects: function () {
					return 'Locally bad things';
				}
			}).length, 2);

			var sample3 = {
				_globalOptions: {
					notExpects: [200]
				}
			};
			assert.strictEqual(globalize.notExpects.call(sample3, {
				notExpects: function () {
					return 'Locally bad things';
				}
			}).length, 2);
		});

	});


	describe('#afterSuccess', function () {

		it('should run the global before method when declared', function (done) {
			var sample = {
				_globalOptions: {
					afterSuccess: function (body) {
						body.success = true;
					}
				}
			};

			globalize.afterSuccess.call(sample, {}, {}).done(function (body) {
				assert.deepEqual(body, { success: true });
				done();
			});
		});

		it('should allow for a global promise async', function (done) {
			var sample = {
				_globalOptions: {
					afterSuccess: function (body) {
						return when.promise(function (resolve, reject) {
							body.success = true;
							resolve();
						});
					}
				}
			};

			globalize.afterSuccess.call(sample, {}, {}).done(function (body) {
				assert.deepEqual(body, { success: true });
				done();
			});
		});

		it('should call the global promise before the local one', function (done) {
			var calledFirst;
			var calls = 0;

			var sample = {
				_globalOptions: {
					afterSuccess: function (params) {
						if (!calledFirst) calledFirst = 'global';
						calls++;
					}
				}
			};

			globalize.afterSuccess.call(sample, {
				afterSuccess: function () {
					if (!calledFirst) calledFirst = 'local';
					calls++;
				}
			}, {}).done(function (params) {
				assert.equal(calledFirst, 'global');
				assert.equal(calls, 2);
				done();
			});
		});

		it('should not run the globals when globals is false', function (done) {
			var sample = {
				_globalOptions: {
					afterSuccess: function (body) {
						body.success = true;
					}
				}
			};

			globalize.afterSuccess.call(sample, {
				globals: false
			}, {}).done(function (body) {
				assert.deepEqual(body, {});
				//done();
			});

			globalize.afterSuccess.call(sample, {
				globals: {
					afterSuccess: false
				}
			}, {}).done(function (body) {
				assert.deepEqual(body, {});
				done();
			});
		});

	});

	describe('#afterFailure', function () {

		it('should run the global before method when declared', function (done) {
			var sample = {
				_globalOptions: {
					afterFailure: function (err) {
						err.code = 'oauth_refresh';
					}
				}
			};

			globalize.afterFailure.call(sample, {}, {}).done(function (err) {
				assert.deepEqual(err, { code: 'oauth_refresh' });
				done();
			});
		});

		it('should allow for a global promise async', function (done) {
			var sample = {
				_globalOptions: {
					afterFailure: function (err) {
						return when.promise(function (resolve, reject) {
							err.code = 'oauth_refresh';
							resolve();
						});
					}
				}
			};

			globalize.afterFailure.call(sample, {}, {}).done(function (err) {
				assert.deepEqual(err, { code: 'oauth_refresh' });
				done();
			});
		});

		it('should call the global promise before the local one', function (done) {
			var calledFirst;
			var calls = 0;

			var sample = {
				_globalOptions: {
					afterFailure: function () {
						if (!calledFirst) calledFirst = 'global';
						calls++;
					}
				}
			};

			globalize.afterFailure.call(sample, {
				afterFailure: function () {
					if (!calledFirst) calledFirst = 'local';
					calls++;
				}
			}, {}).done(function () {
				assert.equal(calledFirst, 'global');
				assert.equal(calls, 2);
				done();
			});
		});

		it('should not run the global when globals is false', function (done) {
			var sample = {
				_globalOptions: {
					afterFailure: function (err) {
						err.code = 'oauth_refresh';
					}
				}
			};

			globalize.afterFailure.call(sample, {
				globals: false
			}, {}).done(function (err) {
				assert.deepEqual(err, {});
				//done();
			});

			globalize.afterFailure.call(sample, {
				globals: {
					afterFailure: false
				}
			}, {}).done(function (err) {
				assert.deepEqual(err, {});
				done();
			});
		});


	});


	describe('#afterHeaders', function () {

		it('should run the global before method when declared', function (done) {
			var sampleThread = {
				_globalOptions: {
					afterHeaders: function (error, params, body, res) {
						return {
							success: true
						};
					}
				}
			};

			globalize.afterHeaders.call(sampleThread, {}, null, {}, {}, {}).done(function (header) {
				assert.deepEqual(header, {
					success: true
				});
				done();
			});
		});

		it('should allow for a global promise async', function (done) {
			var sampleThread = {
				_globalOptions: {
					afterHeaders: function (error, params, body, res) {
						return when.promise(function (resolve, reject) {
							resolve({
								success: true
							});
						});
					}
				}
			};

			globalize.afterHeaders.call(sampleThread, {}, {}).done(function (header) {
				assert.deepEqual(header, {
					success: true
				});
				done();
			});
		});

		it('should call the global promise before the local one', function (done) {
			var calledFirst;
			var calls = 0;

			var sampleThread = {
				_globalOptions: {
					afterHeaders: function (error, params, body, res) {
						calledFirst = calledFirst || 'global';
						calls++;
					}
				}
			};

			globalize.afterHeaders.call(sampleThread, {
				afterHeaders: function () {
					calledFirst = calledFirst || 'local';
					calls++;
				}
			}, {}).done(function (params) {
				assert.equal(calledFirst, 'global');
				assert.equal(calls, 2);
				done();
			});
		});

		it('should make local take precedence over global via defaultsDeep', function (done) {
			var sampleThread = {
				_globalOptions: {
					afterHeaders: function (error, params, body, res) {
						return {
							test: 123
						};
					}
				}
			};

			globalize.afterHeaders.call(sampleThread, {
				afterHeaders: function () {
					return {
						test: 456
					};
				}
			}, {}).done(function (headers) {
				assert.equal(headers.test, 456);
				done();
			});
		});

		it('should not run the globals when globals is false', function (done) {
			var sampleThread = {
				_globalOptions: {
					afterHeaders: function (error, params, body, res) {
						return {
							success: true
						};
					}
				}
			};

			globalize.afterHeaders.call(sampleThread, {
				globals: false
			}, {}).done(function (headers) {
				assert.deepEqual(headers, {});
				//done();
			});

			globalize.afterHeaders.call(sampleThread, {
				globals: {
					afterHeaders: false
				}
			}, {}).done(function (headers) {
				assert.deepEqual(headers, {});
				done();
			});
		});

	});

});
