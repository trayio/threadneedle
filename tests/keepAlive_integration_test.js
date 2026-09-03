var assert			= require('assert');
var http			= require('http');
var net				= require('net');

var { randString }	= require('../lib/utils/mout');
var resolveKeepAliveAgent	= require('../lib/addMethod/keepAliveAgent');
var ThreadNeedle	= require('../');


describe('#keepAlive integration', function () {

	var server;
	var host;
	var closedPort;

	//Records every setKeepAlive call made while these tests run
	var armed;
	var originalSetKeepAlive;

	before(function (done) {
		originalSetKeepAlive = net.Socket.prototype.setKeepAlive;
		net.Socket.prototype.setKeepAlive = function (enable, delay) {
			armed.push({ enable: enable, delay: delay, at: Date.now() });
			return originalSetKeepAlive.apply(this, arguments);
		};

		server = http.createServer();

		server.listen(0, function () {
			host = 'http://localhost:' + server.address().port;

			/*
			  A port reserved then released, so requests to it are refused. Lets us
			  check protocol handling without a TLS server, and so without a key.
			*/
			var scout = net.createServer();
			scout.listen(0, function () {
				closedPort = scout.address().port;
				scout.close(done);
			});
		});
	});

	after(function (done) {
		net.Socket.prototype.setKeepAlive = originalSetKeepAlive;
		server.close(done);
	});

	beforeEach(function () {
		armed = [];
	});

	function errorCodeOf (error) {
		return ( ( error.body && ( error.body.code || error.body.errno ) ) || error.code );
	}

	describe('Protocol handling', function () {

		/*
		  The rest of the suite runs against http, which is how an http-only agent
		  went unnoticed. Node checks the agent's protocol before opening a socket,
		  so reaching the network at all is what proves this.
		*/
		it('should reach the network on an https request rather than reject the agent', function (done) {
			var name = randString(10);
			var threadneedle = new ThreadNeedle();

			threadneedle.addMethod(name, {
				method: 'get',
				url: 'https://127.0.0.1:' + closedPort + '/' + name
			});

			threadneedle[name]({}).done(function () {
				done(new Error('nothing should be listening on this port'));
			}, function (error) {
				assert.strictEqual(errorCodeOf(error), 'ECONNREFUSED');
				done();
			});
		});

		/*
		  needle reuses the same agent for the redirect target, so an agent fixed
		  to one protocol threw here - uncaught, taking the process down. Several
		  connectors follow redirects, and http-client exposes it as a user option.
		*/
		it('should follow a redirect that switches protocol', function (done) {
			var name = randString(10);
			var threadneedle = new ThreadNeedle();

			server.once('request', function (req, res) {
				res.writeHead(302, { location: 'https://127.0.0.1:' + closedPort + '/moved' });
				res.end();
			});

			threadneedle.addMethod(name, {
				method: 'get',
				url: host + '/' + name,
				options: { follow_max: 3 }
			});

			threadneedle[name]({}).done(function () {
				done(new Error('nothing should be listening on the redirect target'));
			}, function (error) {
				//Reaching the target at all is the point - it fails on the refused connection
				assert.strictEqual(errorCodeOf(error), 'ECONNREFUSED');
				done();
			});
		});

		/*
		  needle connects to the proxy, not the target, so the socket's protocol is
		  the proxy's. Picking from `options.protocol` handles that for free.
		*/
		it('should connect over the proxy\'s protocol, not the target\'s', function (done) {
			var name = randString(10);
			var threadneedle = new ThreadNeedle();

			//The plain http server above stands in for an http proxy
			server.once('request', function (req, res) {
				res.writeHead(200, { 'content-type': 'text/plain' });
				res.end('via proxy');
			});

			threadneedle.addMethod(name, {
				method: 'get',
				url: 'https://example.com/' + name,
				expects: 200,
				options: { proxy: host }
			});

			threadneedle[name]({}).done(function (result) {
				assert.strictEqual(result.body, 'via proxy');
				assert.strictEqual(armed[0].delay, resolveKeepAliveAgent.KEEPALIVE_DELAY);
				done();
			}, done);
		});

		/*
		  Pins the failure the tests above rely on: if Node stopped rejecting a
		  mismatched agent, they would quietly lose their teeth.
		*/
		it('should show that a mismatched agent is what breaks such a request', function (done) {
			var name = randString(10);
			var threadneedle = new ThreadNeedle();

			threadneedle.addMethod(name, {
				method: 'get',
				url: 'https://127.0.0.1:' + closedPort + '/' + name,
				//An http agent on an https url, as 1.19.0 installed globally
				options: { agent: function () { return new http.Agent({ keepAlive: false }); } }
			});

			threadneedle[name]({}).done(function () {
				done(new Error('a mismatched agent should not have connected'));
			}, function (error) {
				assert.strictEqual(errorCodeOf(error), 'ERR_INVALID_PROTOCOL');
				done();
			});
		});

	});

	describe('Arming', function () {

		/*
		  The point of the fix: Node's own `keepAliveMsecs` is applied only once a
		  socket returns to the pool, after the response, which is too late.
		*/
		it('should arm keep-alive before the response arrives', function (done) {
			var name = randString(10);
			var threadneedle = new ThreadNeedle();
			var armedBeforeServerReplied;

			server.once('request', function (req, res) {
				armedBeforeServerReplied = armed.length > 0;
				//Hold the request open, as a slow API would
				setTimeout(function () {
					res.writeHead(200);
					res.end('ok');
				}, 150);
			});

			threadneedle.addMethod(name, {
				method: 'get',
				url: host + '/' + name,
				expects: 200
			});

			threadneedle[name]({}).done(function () {
				assert.strictEqual(
					armedBeforeServerReplied, true,
					'keep-alive should be armed while the request is still in flight'
				);
				assert.strictEqual(armed[0].enable, true);
				assert.strictEqual(armed[0].delay, resolveKeepAliveAgent.KEEPALIVE_DELAY);
				done();
			}, done);
		});

	});

	describe('Disabling', function () {

		function respondOk () {
			server.once('request', function (req, res) {
				res.writeHead(200);
				res.end('ok');
			});
		}

		it('should attach no agent when a method disables it', function (done) {
			var name = randString(10);
			var threadneedle = new ThreadNeedle();
			respondOk();

			threadneedle.addMethod(name, {
				method: 'get',
				url: host + '/' + name,
				expects: 200,
				disableKeepAliveAgent: true
			});

			threadneedle[name]({}).done(function () {
				assert.strictEqual(armed.length, 0, 'no keep-alive should have been armed');
				done();
			}, done);
		});

		it('should attach no agent when the connector disables it globally', function (done) {
			var name = randString(10);
			var threadneedle = new ThreadNeedle();
			threadneedle.global({ disableKeepAliveAgent: true });
			respondOk();

			threadneedle.addMethod(name, {
				method: 'get',
				url: host + '/' + name,
				expects: 200
			});

			threadneedle[name]({}).done(function () {
				assert.strictEqual(armed.length, 0, 'no keep-alive should have been armed');
				done();
			}, done);
		});

		it('should let a method re-enable it where the connector disabled it', function (done) {
			var name = randString(10);
			var threadneedle = new ThreadNeedle();
			threadneedle.global({ disableKeepAliveAgent: true });
			respondOk();

			threadneedle.addMethod(name, {
				method: 'get',
				url: host + '/' + name,
				expects: 200,
				disableKeepAliveAgent: false
			});

			threadneedle[name]({}).done(function () {
				assert.strictEqual(armed[0].delay, resolveKeepAliveAgent.KEEPALIVE_DELAY);
				done();
			}, done);
		});

	});

	describe('Caller overrides', function () {

		it('should use an agent supplied by the method instead of its own', function (done) {
			var name = randString(10);
			var threadneedle = new ThreadNeedle();
			var used = false;

			class RecordingAgent extends http.Agent {
				createConnection (options, callback) {
					used = true;
					return super.createConnection(options, callback);
				}
			}
			var mine = new RecordingAgent({ keepAlive: false });

			server.once('request', function (req, res) {
				res.writeHead(200);
				res.end('ok');
			});

			threadneedle.addMethod(name, {
				method: 'get',
				url: host + '/' + name,
				expects: 200,
				//Substitution keeps what a function returns, so the agent's prototype survives
				options: { agent: function () { return mine; } }
			});

			threadneedle[name]({}).done(function () {
				assert.strictEqual(used, true, 'the method\'s own agent should have been used');
				done();
			}, done);
		});

		it('should let a method opt out of keep-alive with `agent: false`', function (done) {
			var name = randString(10);
			var threadneedle = new ThreadNeedle();

			server.once('request', function (req, res) {
				res.writeHead(200);
				res.end('ok');
			});

			threadneedle.addMethod(name, {
				method: 'get',
				url: host + '/' + name,
				expects: 200,
				options: { agent: function () { return false; } }
			});

			threadneedle[name]({}).done(function () {
				assert.strictEqual(armed.length, 0, 'no keep-alive should have been armed');
				done();
			}, done);
		});

	});

});
