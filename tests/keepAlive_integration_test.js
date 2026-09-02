var assert			= require('assert');
var fs				= require('fs');
var path			= require('path');
var https			= require('https');
var net				= require('net');

var { randString }	= require('../lib/utils/mout');
var ThreadNeedle	= require('../');


describe('#keepAlive integration', function () {

	var server;
	var host;

	//Records every setKeepAlive call made while these tests run
	var armed;
	var originalSetKeepAlive;

	before(function (done) {
		originalSetKeepAlive = net.Socket.prototype.setKeepAlive;
		net.Socket.prototype.setKeepAlive = function (enable, delay) {
			armed.push({ enable: enable, delay: delay, at: Date.now() });
			return originalSetKeepAlive.apply(this, arguments);
		};

		server = https.createServer({
			key: fs.readFileSync(path.join(__dirname, 'fixtures/localhost-key.pem')),
			cert: fs.readFileSync(path.join(__dirname, 'fixtures/localhost-cert.pem'))
		});

		server.listen(0, function () {
			host = 'https://localhost:' + server.address().port;
			done();
		});
	});

	after(function (done) {
		net.Socket.prototype.setKeepAlive = originalSetKeepAlive;
		server.close(done);
	});

	beforeEach(function () {
		armed = [];
	});

	/*
	  The whole REST suite otherwise runs against `http://localhost`, which is
	  why an http-only agent installed as a needle default went unnoticed. An
	  https request is the case that threw ERR_INVALID_PROTOCOL.
	*/
	it('should complete an https request', function (done) {
		var name = randString(10);
		var threadneedle = new ThreadNeedle();

		server.once('request', function (req, res) {
			res.writeHead(200, { 'content-type': 'application/json' });
			res.end(JSON.stringify({ ok: true }));
		});

		threadneedle.addMethod(name, {
			method: 'get',
			url: host + '/' + name,
			expects: 200,
			options: { rejectUnauthorized: false }
		});

		threadneedle[name]({}).done(function (result) {
			assert.deepStrictEqual(result.body, { ok: true });
			done();
		}, done);
	});

	/*
	  The point of the fix. Node's own `keepAliveMsecs` is applied when a socket
	  returns to the pool, i.e. after the response - too late for a call that
	  idles behind the NAT gateway while awaiting a slow reply.
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
			expects: 200,
			options: { rejectUnauthorized: false }
		});

		threadneedle[name]({}).done(function () {
			assert.strictEqual(
				armedBeforeServerReplied, true,
				'keep-alive should be armed while the request is still in flight'
			);
			assert.strictEqual(armed[0].enable, true);
			assert.strictEqual(armed[0].delay, require('../lib/addMethod/keepAliveAgent').KEEPALIVE_DELAY);
			done();
		}, done);
	});

	it('should use an agent supplied by the method instead of its own', function (done) {
		var name = randString(10);
		var threadneedle = new ThreadNeedle();
		var used = false;

		class RecordingAgent extends https.Agent {
			createConnection (options, callback) {
				used = true;
				return super.createConnection(options, callback);
			}
		}
		var mine = new RecordingAgent({ keepAlive: false, rejectUnauthorized: false });

		server.once('request', function (req, res) {
			res.writeHead(200);
			res.end('ok');
		});

		threadneedle.addMethod(name, {
			method: 'get',
			url: host + '/' + name,
			expects: 200,
			//A function value survives substitution, which an agent object does not
			options: { rejectUnauthorized: false, agent: function () { return mine; } }
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
			options: { rejectUnauthorized: false, agent: function () { return false; } }
		});

		threadneedle[name]({}).done(function () {
			assert.strictEqual(armed.length, 0, 'no keep-alive should have been armed');
			done();
		}, done);
	});

});
