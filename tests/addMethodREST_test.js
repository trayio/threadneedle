var assert       = require('assert');
var _            = require('lodash');
var express      = require('express');
var bodyParser   = require('body-parser');
var when         = require('when');
var fs           = require('fs');
var randString   = require('mout/random/randString');
var ThreadNeedle = require('../');


describe('#addMethodREST', function () {

	describe('Validation', function () {

		var threadneedle;
		beforeEach(function () {
			threadneedle = new ThreadNeedle();
		});

		it('should error when `methodName` isn\'t provided', function () {
			var caught = 0;
			try {
				threadneedle.addMethod();
			} catch (err) {
				assert.strictEqual(err.message, `The first parameter passed to 'addMethod' should be a string. Operation: `);
				caught++;
			}

			try {
				threadneedle.addMethod(true);
			} catch (err) {
				assert(err.message, `The 'url' config parameter should be declared. Operation: create_list`);
				caught++;
			}

			assert.strictEqual(caught, 2);
		});

		it('should error when a method already exists for that name', function () {
			var caught = 0;
			try {
				threadneedle.addMethod('addMethod', {
					url: 'http://yourdomain.com',
					method: 'get'
				});
			} catch (err) {
				assert.strictEqual(err.message, 'Method `addMethod` has already been declared.');
				caught++;
			}
			assert.strictEqual(caught, 1);
		});

		it('should error when a url isn\'t declared', function () {
			var caught = 0;
			try {
				threadneedle.addMethod('createList', {});
			} catch (err) {
				assert.strictEqual(err.message, `The 'url' config parameter should be declared. Operation: create_list`);
				caught++;
			}
			assert.strictEqual(caught, 1);
		});

		it('should error when the method is invalid', function () {
			var caught = 0;
			try {
				threadneedle.addMethod('createList', {
					url: 'http://yourdomain.com',
					method: 'chris'
				});
			} catch (err) {
				assert.strictEqual(err.message, 'The `method` "chris" is not a valid method. Allowed methods are: get, put, post, delete, head, patch, options');
				caught++;
			}
			assert.strictEqual(caught, 1);
		});

		it('should error if `type` is not valid', function () {
			const privateThreadneedle = new ThreadNeedle();
			try {
				privateThreadneedle.addMethod(randString(10), {
					type: 'test',
					method: 'get',
					url: 'http://localhost:4000',
					expects: 200
				});
				assert.fail('Invalid type did not throw an error');
			} catch (globalError) {
				assert(globalError.message.includes(`\`type\` must be strings 'REST' or 'SOAP'`));
			}
		});

	});


	describe('Running', function () {

		var host = 'http://localhost:4000';
		var server;
		var app;

		before(function (done) {
			app = express();
			app.use(bodyParser.json());
			app.use(bodyParser.urlencoded({
				extended: true
			}));
			server = app.listen(4000, done);
		});

		after(function (done) {
			server.close(done);
		});

		var threadneedle;
		beforeEach(function () {
			threadneedle = new ThreadNeedle();
		});

		it('should work with a basic example', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'get',
				url: host + '/' + name,
				expects: 200
			});

			app.get('/' + name, function (req, res) {
				res.status(200).send('ok');
			});

			threadneedle[name]().done(function (result) {
				assert.equal(result.body, 'ok');
				done();
			});
		});

		it('should work with a basic example and specified type `rest`', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				type: 'REST',
				method: 'get',
				url: host + '/' + name,
				expects: 200
			});

			app.get('/' + name, function (req, res) {
				res.status(200).send('ok');
			});

			threadneedle[name]().done(function (result) {
				assert.equal(result.body, 'ok');
				done();
			});
		});

		it('should substitute to the url with a basic example', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'get',
				url: host + '/' + name + '?key={{apiKey}}',
				expects: 200
			});

			app.get('/' + name, function (req, res) {
				res.status(200).send(req.query.key);
			});

			threadneedle[name]({
				apiKey: '123'
			}).done(function (result) {
				assert.equal(result.body, '123');
				done();
			});
		});


		it('should substitute to the data', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name + '?key={{apiKey}}',
				data: {
					name: '{{name}}',
					age: '{{age}}'
				},
				expects: 200
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json({
					query: req.query,
					body: req.body
				});
			});

			threadneedle[name]({
				apiKey: '123',
				name: 'Chris',
				age: 25
			}).done(function (result) {
				assert.deepEqual(result.body.query, {
					key: '123'
				});
				assert.deepEqual(result.body.body, {
					name: 'Chris',
					age: 25
				});
				done();
			});
		});

		it('should substitute to the headers', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				options: {
					headers: {
						'Authorization': 'Basic {{apiKey}}'
					}
				},
				expects: 200
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json(req.headers);
			});

			threadneedle[name]({
				apiKey: '123'
			}).done(function (result) {
				assert.equal(result.body.authorization, 'Basic 123');
				done();
			});
		});

		it('should substitute to the auth', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				options: {
					username: '{{username}}',
					password: '{{password}}'
				},
				expects: 200
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json(req.headers);
			});

			threadneedle[name]({
				username: 'chris',
				password: 'hello'
			}).done(function (result) {
				assert.equal(result.body.authorization, 'Basic Y2hyaXM6aGVsbG8=');
				done();
			});
		});

		it('should reject on invalid status code', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				expects: 201
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json(req.headers);
			});

			threadneedle[name]().done(function (result) {}, function (result) {
				assert.equal(result.body.message, 'Invalid response status code');
				done();
			});
		});

		it('should reject on invalid status codes', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				expects: [ 202, 201 ]
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json(req.headers);
			});

			threadneedle[name]().done(function (result) {}, function (result) {
				assert.equal(result.body.message, 'Invalid response status code');
				done();
			});
		});

		it('should reject on invalid body', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				expects: 'success'
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json({
					failure: true
				});
			});

			threadneedle[name]().done(function (result) {}, function (result) {
				assert.equal(result.body.message, 'Invalid response body');
				done();
			});
		});

		it('should be ok when notExpect status code is fine', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				notExpects: 201
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json({
					result: true
				});
			});

			threadneedle[name]().done(function (result) {
				assert.deepEqual(result.body, {
					result: true
				});
				done();
			});
		});

		it('should reject when notExpect status code is bad', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				notExpects: 200
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json({
					result: true
				});
			});

			threadneedle[name]().done(function () {}, function (result) {
				assert.equal(result.body.message, 'Invalid response status code');
				done();
			});
		});

		it('should be ok when notExpect body is fine', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				notExpects: 'success'
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json({
					result: true
				});
			});

			threadneedle[name]().done(function (result) {
				assert.deepEqual(result.body, {
					result: true
				});
				done();
			});
		});

		it('should reject when notExpect body is bad', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				notExpects: 'result'
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json({
					result: true
				});
			});

			threadneedle[name]().done(function () {}, function (result) {
				assert.equal(result.body.message, 'Invalid response body');
				done();
			});
		});


		it('should run `before` on the params synchronously', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				before: function (params) {
					params.name = params.firstName + ' ' + params.lastName;
					return params;
				},
				data: function (params) {
					return params;
				}
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json(req.body);
			});

			threadneedle[name]({
				firstName: 'Chris',
				lastName: 'Houghton'
			}).done(function (result) {
				assert.deepEqual(result.body, {
					firstName: 'Chris',
					lastName: 'Houghton',
					name: 'Chris Houghton'
				});
				done();
			});
		});

		it('should run `before` on the params asynchronously', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				before: function (params) {
					return when.promise(function (resolve) {
						params.name = params.firstName + ' ' + params.lastName;
						resolve(params);
					});
				},
				data: function (params) {
					return params;
				}
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json(req.body);
			});

			threadneedle[name]({
				firstName: 'Chris',
				lastName: 'Houghton'
			}).done(function (result) {
				assert.deepEqual(result.body, {
					firstName: 'Chris',
					lastName: 'Houghton',
					name: 'Chris Houghton'
				});
				done();
			});
		});


		it('should run `afterSuccess` on the params synchronously', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				afterSuccess: function (body) {
					delete body.firstName;
					body.age = 25;
				},
				data: {
					firstName: '{{firstName}}'
				}
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json(req.body);
			});

			threadneedle[name]({
				firstName: 'Chris'
			}).done(function (result) {
				assert.deepEqual(result.body, {
					age: 25
				});
				done();
			});
		});

		it('should run `afterSuccess` on the params asynchronously', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				afterSuccess: function (body) {
					return when.promise(function (resolve) {
						body.age = 25;
						resolve();
					});
				},
				data: {
					firstName: '{{firstName}}'
				}
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json(req.body);
			});

			threadneedle[name]({
				firstName: 'Chris'
			}).done(function (result) {
				assert.deepEqual(result.body, {
					firstName: 'Chris',
					age: 25
				});
				done();
			});
		});

		it('Should override with returned value in `afterSuccess`', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				afterSuccess: function (body) {
					return {
						data: body
					};
				},
				data: {
					firstName: '{{firstName}}'
				}
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json([req.body]);
			});

			threadneedle[name]({
				firstName: 'Chris'
			}).done(function (result) {
				assert.deepEqual(result.body.data, [
					{
						firstName: 'Chris'
					}
				]);
				done();
			});
		});


		it('should run `afterFailure` on the params synchronously', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				afterFailure: function (body) {
					body.code = 'oauth_refresh';
					return body;
				},
				expects: 201,
				data: {
					firstName: '{{firstName}}'
				}
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json(req.body);
			});

			threadneedle[name]({
				firstName: 'Chris'
			}).done(function () {}, function (result) {
				assert.deepEqual(result.body, {
					message: 'Invalid response status code',
					response: {
						statusCode: 200,
						body: {
							firstName: 'Chris'
						}
					},
					expects: {
						statusCode: [201]
					},
					code: 'oauth_refresh'
				});
				done();
			});
		});

		it('should run `afterFailure` on the params asynchronously', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				afterFailure: function (body) {
					body.code = 'oauth_refresh';
					return when(body);
				},
				expects: 201,
				data: {
					firstName: '{{firstName}}'
				}
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json(req.body);
			});

			threadneedle[name]({
				firstName: 'Chris'
			}).done(function () {}, function (result) {
				assert.deepEqual(result.body, {
					message: 'Invalid response status code',
					response: {
						statusCode: 200,
						body: {
							firstName: 'Chris'
						}
					},
					expects: {
						statusCode: [201]
					},
					code: 'oauth_refresh'
				});
				done();
			});
		});

		it('Should override with returned value in `afterFailure`', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				expects: 201,
				afterFailure: function (body) {
					return {
						meh: 'no error here'
					};
				},
				data: {
					firstName: '{{firstName}}'
				}
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json([req.body]);
			});

			threadneedle[name]({
				firstName: 'Chris'
			}).done(function () {}, function (result) {
				assert.equal(result.body.meh, 'no error here');
				done();
			});
		});


		it('should run `afterHeaders` on the params synchronously', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				afterHeaders: function (error, params, body, res) {
					return {
						metaData: 'ABC'
					};
				},
				data: {
					firstName: '{{firstName}}'
				}
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json(req.body);
			});

			threadneedle[name]({
				firstName: 'Chris'
			}).done(function (result) {
				assert.deepEqual(result.headers, {
					metaData: 'ABC'
				});
				done();
			});
		});

		it('should run `afterHeaders` on the params asynchronously', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'post',
				url: host + '/' + name,
				afterHeaders: function (error, params, body, res) {
					return when.promise(function (resolve) {
						resolve({
							metaData: 'XYZ'
						});
					});
				},
				data: {
					firstName: '{{firstName}}'
				}
			});

			app.post('/' + name, function (req, res) {
				res.status(200).json(req.body);
			});

			threadneedle[name]({
				firstName: 'Chris'
			}).done(function (result) {
				assert.deepEqual(result.headers, {
					metaData: 'XYZ'
				});
				done();
			});
		});

		function afterHeaderTestModel (name) {
			return {
				method: 'post',
				url: host + '/' + name,
				expects: 200,
				afterSuccess: function (body, params, res) {
					if (params.asFlag) {
						throw new Error('afterSuccess Error');
					}
				},
				afterFailure: function (body, params, res) {
					if (params.afFlag) {
						throw new Error('afterFailure Error');
					}
				},
				afterHeaders: function (error, params, body, res) {
					if (params.ahFlag) {
						throw new Error('afterHeaders Error');
					} else {
						return {
							gotError: !!error
						};
					}
				}
			};
		}

		it('Should place `afterHeaders` object in header after afterSuccess resolve', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, afterHeaderTestModel(name));

			app.post('/' + name, function (req, res) {
				res.status(200).json({
					success: true
				});
			});

			threadneedle[name]({
				asFlag: false,
				afFlag: false,
				ahFlag: false
			})
			.done(
				function (result) {
					assert.deepEqual(result.headers.gotError, false);
					assert.deepEqual(result.body.success, true);
					done();
				},
				function (result) {
					assert.fail('Wrong clause - failing');
					done();
				}
			);
		});

		it('Should place `afterHeaders` error in body after afterSuccess resolve', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, afterHeaderTestModel(name));

			app.post('/' + name, function (req, res) {
				res.status(200).json({
					success: true
				});
			});

			threadneedle[name]({
				asFlag: false,
				afFlag: false,
				ahFlag: true
			})
			.done(
				function (result) {
					assert.fail('Wrong clause - succeeding');
					done();
				},
				function (result) {
					assert.deepEqual(result.headers, {});
					assert.deepEqual(result.body.message, 'afterHeaders Error');
					done();
				}
			);
		});

		it('Should place `afterHeaders` object in header after afterSuccess reject', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, afterHeaderTestModel(name));

			app.post('/' + name, function (req, res) {
				res.status(200).json({
					success: true
				});
			});

			threadneedle[name]({
				asFlag: true,
				afFlag: false,
				ahFlag: false
			})
			.done(
				function (result) {
					assert.fail('Wrong clause - succeeding');
					done();
				},
				function (result) {
					assert.deepEqual(result.headers.gotError, true);
					assert.deepEqual(result.body.message, 'afterSuccess Error');
					done();
				}
			);
		});

		it('Should place `afterHeaders` error in body after afterSuccess reject', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, afterHeaderTestModel(name));

			app.post('/' + name, function (req, res) {
				res.status(200).json({
					success: true
				});
			});

			threadneedle[name]({
				asFlag: true,
				afFlag: false,
				ahFlag: true
			})
			.done(
				function (result) {
					assert.fail('Wrong clause - succeeding');
					done();
				},
				function (result) {
					assert.deepEqual(result.headers, {});
					assert.deepEqual(result.body.message, 'afterHeaders Error');
					done();
				}
			);
		});

		it('Should place `afterHeaders` object in header after afterFailure resolve', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, afterHeaderTestModel(name));

			app.post('/' + name, function (req, res) {
				res.status(400).json({
					success: false
				});
			});

			threadneedle[name]({
				asFlag: false,
				afFlag: false,
				ahFlag: false
			})
			.done(
				function (result) {
					assert.fail('Wrong clause - succeeding');
					done();
				},
				function (result) {
					assert.deepEqual(result.headers.gotError, true);
					assert.deepEqual(result.body.response.body.success, false);
					done();
				}
			);
		});

		it('Should place `afterHeaders` error in body after afterFailure resolve', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, afterHeaderTestModel(name));

			app.post('/' + name, function (req, res) {
				res.status(400).json({
					success: false
				});
			});

			threadneedle[name]({
				asFlag: false,
				afFlag: false,
				ahFlag: true
			})
			.done(
				function (result) {
					assert.fail('Wrong clause - succeeding');
					done();
				},
				function (result) {
					assert.deepEqual(result.headers, {});
					assert.deepEqual(result.body.message, 'afterHeaders Error');
					done();
				}
			);
		});

		it('Should place `afterHeaders` object in header after afterFailure reject', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, afterHeaderTestModel(name));

			app.post('/' + name, function (req, res) {
				res.status(400).json({
					success: false
				});
			});

			threadneedle[name]({
				asFlag: false,
				afFlag: true,
				ahFlag: false
			})
			.done(
				function (result) {
					assert.fail('Wrong clause - succeeding');
					done();
				},
				function (result) {
					assert.deepEqual(result.headers.gotError, true);
					assert.deepEqual(result.body.message, 'afterFailure Error');
					done();
				}
			);
		});

		it('Should place `afterHeaders` error in body after afterFailure reject', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, afterHeaderTestModel(name));

			app.post('/' + name, function (req, res) {
				res.status(400).json({
					success: false
				});
			});

			threadneedle[name]({
				asFlag: false,
				afFlag: true,
				ahFlag: true
			})
			.done(
				function (result) {
					assert.fail('Wrong clause - succeeding');
					done();
				},
				function (result) {
					assert.deepEqual(result.headers, {});
					assert.deepEqual(result.body.message, 'afterHeaders Error');
					done();
				}
			);
		});


		it('should add a {{temp_file}} parameter when `fileHandler` is true', function (done) {
			var name = randString(10);
			threadneedle.addMethod(name, {
				method: 'get',
				url: host + '/' + name,
				fileHandler: true,
				data: {
					firstName: '{{firstName}}'
				},
				options: {
					output: function (input) {
						// should be available pre substituations
						assert(input.temp_file);
					}
				},
				afterSuccess: function (body, params) {
					assert(params.temp_file);
					assert.equal(params.temp_file.indexOf('/tmp/'), 0);
					assert.equal(params.temp_file.length, 41);
				}
			});

			app.get('/' + name, function (req, res) {
				var filePath = __dirname + '/sample-file.png';
				var stat = fs.statSync(filePath);
				res.writeHead(200, {
					'Content-Type': 'image/png',
					'Content-Length': stat.size
				});
				var readStream = fs.createReadStream(filePath);
				readStream.pipe(res);
			});

			threadneedle[name]({
				firstName: 'Chris'
			}).done(function (body) {
				done();
			});
		});


	});


	describe('Ad-hoc', function () {

		var threadneedle;
		beforeEach(function () {
			threadneedle = new ThreadNeedle();
		});

		it('should be fine with allowing the method config to be a function', function (done) {

			var called = false;

			threadneedle.addMethod('myCustomMethod', function (params) {

				assert(_.isObject(params));

				var self = this;

				return when.promise(function (resolve, reject) {

					assert.equal(params.name, 'Chris');
					assert.deepEqual(self, threadneedle); // context
					called = true;

					setTimeout(function () {
						resolve();
					}, 200);

				});
			});

			threadneedle.myCustomMethod({
				name: 'Chris'
			}).done(function () {
				assert(called);
				done();
			}, function (err) {
				assert.fail(err);
			});

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
			var name = randString(10);
			threadneedle.addMethod(name, functionModel, afterHeadersFunction);

			threadneedle[name]({
				passFlag: true,
				ahFlag: true
			})
			.done(
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
			var name = randString(10);
			threadneedle.addMethod(name, functionModel, afterHeadersFunction);

			threadneedle[name]({
				passFlag: true,
				ahFlag: false
			})
			.done(
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
			var name = randString(10);
			threadneedle.addMethod(name, functionModel, afterHeadersFunction);

			threadneedle[name]({
				passFlag: false,
				ahFlag: true
			})
			.done(
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
			var name = randString(10);
			threadneedle.addMethod(name, functionModel, afterHeadersFunction);

			threadneedle[name]({
				passFlag: false,
				ahFlag: false
			})
			.done(
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
			var name = randString(10);
			threadneedle.addMethod(name, functionModel, {});

			threadneedle[name]({
				passFlag: true,
				ahFlag: true
			})
			.done(
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


});
