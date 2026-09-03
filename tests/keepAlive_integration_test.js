var assert			= require('assert');
var http			= require('http');
var net				= require('net');

var { randString }	= require('../lib/utils/mout');
var resolveAgent	= require('../lib/addMethod/keepAliveAgent');
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
			  Reserve a port and immediately release it, so requests to it are
			  refused rather than answered. Used to check protocol handling
			  without needing a TLS server, and so without a checked-in key.
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
		  The whole REST suite otherwise runs against http, which is why an
		  http-only agent installed as a needle default went unnoticed. Node
		  compares the agent's protocol against the request before it opens a
		  socket, so reaching the network at all is the thing worth asserting -
		  no TLS server, and therefore no key material, is needed to prove it.
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
		  The failure the test above guards against, pinned deliberately: if Node
		  ever stops rejecting a mismatched agent, that test would silently lose
		  its teeth, and this one would start failing to say so.
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
		  The point of the fix. Node's own `keepAliveMsecs` is applied when a
		  socket returns to the pool, i.e. after the response - too late for a
		  call that idles behind the NAT gateway while awaiting a slow reply.
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
				assert.strictEqual(armed[0].delay, resolveAgent.KEEPALIVE_DELAY);
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
				//A function value survives substitution, which an agent object does not
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
