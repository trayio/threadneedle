var assert			= require('assert');
var http			= require('http');
var https			= require('https');
var net				= require('net');

var resolveAgent	= require('../lib/addMethod/keepAliveAgent');


describe('#keepAliveAgent', function () {

	describe('Caller overrides', function () {

		it('should return a caller supplied agent untouched', function () {
			var mine = new https.Agent({ keepAlive: true });
			assert.strictEqual(resolveAgent({ agent: mine }), mine);
		});

		it('should pass `false` through, so opting out remains possible', function () {
			assert.strictEqual(resolveAgent({ agent: false }), false);
		});

		it('should attach an agent when none was supplied', function () {
			assert.ok(resolveAgent({}) instanceof http.Agent);
		});

	});

	describe('Protocol handling', function () {

		/*
		  Node only enforces its agent/request protocol check when the agent
		  declares a protocol. Declaring none is what lets one agent serve both,
		  which in turn is what stops a redirect from http to https - where
		  needle reuses the original agent - throwing ERR_INVALID_PROTOCOL.

		  If a Node upgrade ever changes that, this is the test that says so.
		*/
		it('should declare no protocol, so either is accepted', function () {
			assert.strictEqual(resolveAgent({}).protocol, undefined);
		});

		function connectionFor (protocol) {
			var agent = resolveAgent({});
			var chosen = null;

			var originals = {};
			Object.keys(resolveAgent.factories).forEach(function (key) {
				originals[key] = resolveAgent.factories[key].createConnection;
				resolveAgent.factories[key].createConnection = function () {
					chosen = key;
					return new net.Socket();
				};
			});

			try {
				agent.createConnection({ protocol: protocol, host: 'example.com', port: 443 }, function () {});
			} finally {
				Object.keys(originals).forEach(function (key) {
					resolveAgent.factories[key].createConnection = originals[key];
				});
			}

			return chosen;
		}

		it('should open a tls connection for an https request', function () {
			assert.strictEqual(connectionFor('https:'), 'https:');
		});

		it('should open a plain connection for an http request', function () {
			assert.strictEqual(connectionFor('http:'), 'http:');
		});

		it('should fall back to a plain connection when the protocol is unknown', function () {
			assert.strictEqual(connectionFor(undefined), 'http:');
		});

	});

	describe('Agent configuration', function () {

		it('should not pool connections, leaving socket lifetime unchanged', function () {
			assert.strictEqual(resolveAgent({}).keepAlive, false);
		});

		it('should arm keep-alive with usable margin inside the NAT idle timeout', function () {
			//AWS NAT gateways drop connections that sit idle for 350 seconds
			var NAT_IDLE_TIMEOUT = 350000;
			var REQUIRED_MARGIN = 30000;

			assert.ok(
				resolveAgent.KEEPALIVE_DELAY <= NAT_IDLE_TIMEOUT - REQUIRED_MARGIN,
				'a probe must land early enough to reset the gateway timer, not just before it'
			);
		});

		it('should return a new agent per request', function () {
			assert.notStrictEqual(resolveAgent({}), resolveAgent({}));
		});

		/*
		  needle assigns TLS options onto `agent.options` when an agent is
		  present, so a shared agent would leak one method's TLS settings or
		  client certificate into every later request in the process.
		*/
		it('should not share TLS options between requests', function () {
			var first = resolveAgent({});
			first.options.rejectUnauthorized = false;

			assert.notStrictEqual(resolveAgent({}).options.rejectUnauthorized, false);
		});

	});

});
