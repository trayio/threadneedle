var assert			= require('assert');
var http			= require('http');
var https			= require('https');

var resolveAgent	= require('../lib/addMethod/keepAliveAgent');


describe('#keepAliveAgent', function () {

	describe('Protocol selection', function () {

		/*
		  `https.Agent` extends `http.Agent`, so `instanceof` cannot tell them
		  apart. `protocol` is the property Node itself compares against the
		  request, and mismatching it is what threw ERR_INVALID_PROTOCOL.
		*/

		it('should return an https agent for an https url', function () {
			assert.strictEqual(resolveAgent('https://example.com/thing', {}).protocol, 'https:');
		});

		it('should return an http agent for an http url', function () {
			assert.strictEqual(resolveAgent('http://example.com/thing', {}).protocol, 'http:');
		});

		it('should ignore the case of the protocol', function () {
			assert.strictEqual(resolveAgent('HTTPS://example.com', {}).protocol, 'https:');
		});

		it('should default to http when the url carries no protocol, as needle does', function () {
			assert.strictEqual(resolveAgent('example.com/thing', {}).protocol, 'http:');
		});

		it('should not be fooled by `https` appearing later in the url', function () {
			assert.strictEqual(resolveAgent('http://example.com/?next=https://x.com', {}).protocol, 'http:');
		});

	});

	describe('Caller overrides', function () {

		it('should return a caller supplied agent untouched', function () {
			var mine = new https.Agent({ keepAlive: true });
			assert.strictEqual(resolveAgent('https://example.com', { agent: mine }), mine);
		});

		it('should pass `false` through, so opting out remains possible', function () {
			assert.strictEqual(resolveAgent('https://example.com', { agent: false }), false);
		});

		it('should attach an agent when none was supplied', function () {
			assert.ok(resolveAgent('https://example.com', {}) instanceof http.Agent);
		});

	});

	describe('Proxies', function () {

		/*
		  Behind a proxy needle connects to the proxy, so the socket's protocol
		  is the proxy's, not the target's. Attaching an agent picked from the
		  target url would reintroduce the protocol mismatch.
		*/

		it('should not attach an agent when `options.proxy` is set', function () {
			assert.strictEqual(resolveAgent('https://example.com', { proxy: 'http://proxy:8080' }), undefined);
		});

		[ 'HTTP_PROXY', 'http_proxy', 'HTTPS_PROXY', 'https_proxy' ].forEach(function (name) {

			it('should not attach an agent when ' + name + ' is set', function () {
				process.env[name] = 'http://proxy:8080';
				try {
					assert.strictEqual(resolveAgent('https://example.com', {}), undefined);
				} finally {
					delete process.env[name];
				}
			});

		});

	});

	describe('Agent configuration', function () {

		it('should not pool connections, leaving socket lifetime unchanged', function () {
			assert.strictEqual(resolveAgent('https://example.com', {}).keepAlive, false);
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
			var first = resolveAgent('https://example.com', {});
			var second = resolveAgent('https://example.com', {});
			assert.notStrictEqual(first, second);
		});

		/*
		  needle assigns TLS options onto `agent.options` when an agent is
		  present, so a shared agent would leak one method's TLS settings or
		  client certificate into every later request in the process.
		*/
		it('should not share TLS options between requests', function () {
			var first = resolveAgent('https://example.com', {});
			first.options.rejectUnauthorized = false;

			var second = resolveAgent('https://example.com', {});
			assert.notStrictEqual(second.options.rejectUnauthorized, false);
		});

	});

});
