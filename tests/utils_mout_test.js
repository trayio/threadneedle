const assert = require('assert');

const {
	randHex,
	guid,
	startsWith,
	setParam,
} = require('../lib/utils/mout');

describe.only('util/mout - setParam', function () {

	it('should add value if it doesn\'t exist', function () {
		assert.strictEqual( setParam('foo.com', 'bar', true), 'foo.com?bar=true' );
		assert.strictEqual( setParam('foo.com?bar=1', 'ipsum', 'dolor'), 'foo.com?bar=1&ipsum=dolor' );
	});

	it('should encode value', function () {
		assert.strictEqual( setParam('foo.com?bar=1', 'ipsum', 'dólôr amèt'), 'foo.com?bar=1&ipsum=d%C3%B3l%C3%B4r%20am%C3%A8t' );
	});

	it('should update value if it exists', function () {
		assert.strictEqual( setParam('foo.com?bar=2', 'bar', false), 'foo.com?bar=false' );
		assert.strictEqual( setParam('foo.com?bar=1&ipsum=dolor%20amet&maecennas=3', 'bar', 'amet'), 'foo.com?bar=amet&ipsum=dolor%20amet&maecennas=3' );
	});

	it('should work with just the query string', function () {
		assert.strictEqual( setParam('?dolor=amet', 'ipsum', 123), '?dolor=amet&ipsum=123' );
		assert.strictEqual( setParam('?dolor=amet&ipsum=5', 'ipsum', 123), '?dolor=amet&ipsum=123' );
		assert.strictEqual( setParam('?dolor=amet&ipsum=5&maecennas=ullamcor', 'ipsum', 123), '?dolor=amet&ipsum=123&maecennas=ullamcor' );
	});

	it('should work with empty url', function () {
		assert.strictEqual( setParam('', 'foo', 'bar'), '?foo=bar' );
		assert.strictEqual( setParam('?', 'foo', 'bar'), '?foo=bar' );
	});

});
