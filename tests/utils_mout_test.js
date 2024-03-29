const assert = require('assert');

const {
	randHex,
	guid,
	startsWith,
	setParam,
	randString,
} = require('../lib/utils/mout');

describe('utils/mout - setParam', function () {
	it('should add value if it doesn\'t exist', function () {
		assert.strictEqual(setParam('foo.com', 'bar', true), 'foo.com?bar=true');
		assert.strictEqual(setParam('foo.com?bar=1', 'ipsum', 'dolor'), 'foo.com?bar=1&ipsum=dolor');
	});

	it('should encode value', function () {
		assert.strictEqual(setParam('foo.com?bar=1', 'ipsum', 'dólôr amèt'), 'foo.com?bar=1&ipsum=d%C3%B3l%C3%B4r%20am%C3%A8t');
	});

	it('should update value if it exists', function () {
		assert.strictEqual(setParam('foo.com?bar=2', 'bar', false), 'foo.com?bar=false');
		assert.strictEqual(setParam('foo.com?bar=1&ipsum=dolor%20amet&maecennas=3', 'bar', 'amet'), 'foo.com?bar=amet&ipsum=dolor%20amet&maecennas=3');
	});

	it('should work with just the query string', function () {
		assert.strictEqual(setParam('?dolor=amet', 'ipsum', 123), '?dolor=amet&ipsum=123');
		assert.strictEqual(setParam('?dolor=amet&ipsum=5', 'ipsum', 123), '?dolor=amet&ipsum=123');
		assert.strictEqual(setParam('?dolor=amet&ipsum=5&maecennas=ullamcor', 'ipsum', 123), '?dolor=amet&ipsum=123&maecennas=ullamcor');
	});

	it('should work with empty url', function () {
		assert.strictEqual(setParam('', 'foo', 'bar'), '?foo=bar');
		assert.strictEqual(setParam('?', 'foo', 'bar'), '?foo=bar');
	});
});

describe('utils/mout - randHex()', function () {
	it('should return a random hexadecimal value', function () {
		var a = randHex(),
			b = randHex();
		assert.notStrictEqual( a, b );
	});

	it('should return a 6 char length hex value by default', function () {
		assert.strictEqual( randHex().length, 6 );
		assert.strictEqual( randHex(0).length, 6 );
	});

	it('should allow custom length', function () {
		assert.strictEqual( randHex(2).length, 2 );
		assert.strictEqual( randHex(5).length, 5 );
		assert.strictEqual( randHex(10).length, 10 );
	});

	it('should handle negative size', function () {
		assert.strictEqual( randHex(-5).length, 6 );
	});

});

describe('utils/mout - guid()', function () {
	it('returns a random guid each call', function () {
		let a = guid();
		let b = guid();

		// match guid v4 format e.g. 3f2504e0-2f89-41d3-9a0c-0305e82c3301
		assert((/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[ab89][a-f0-9]{3}-[a-f0-9]{12}/).test(a));
		assert.notStrictEqual( a, b );
	});
});

describe('utils/mout - startsWith()', function () {

	it('should return true if string starts with prefix', function () {
		assert(startsWith('lorem-ipsum', 'lorem'));
	});

	it('should return false if string does not start with prefix', function () {
		assert(!startsWith('lorem-ipsum', 'ipsum'));
	});

	it('should return true if prefix is empty', function () {
		assert(startsWith('', ''));
		assert(startsWith('lorem', ''));
	});

	it('should treat undefined as empty string', function () {
		assert(!startsWith(void 0, 'ipsum'));
		assert(startsWith('lorem', void 0));
	});

	it('should treat null as empty string', function () {
		assert(startsWith(null, ''));
		assert(startsWith('lorem', null));
	});

});

describe('utils/mout - randString', function () {
	it('should return a string.', function () {
		assert.strictEqual(typeof randString(), 'string');
	});

	it('should default to 8 characters.', function () {
		assert.strictEqual(randString().length, 8);
	});

	it('should allow for user specified lengths.', function () {
		assert.strictEqual(randString(10).length, 10);
	});

	it('should default on invalid lengths.', function () {
		assert.strictEqual(randString(0).length, 8);
		assert.strictEqual(randString('').length, 8);
		assert.strictEqual(randString(false).length, 8);
		assert.strictEqual(randString(-1).length, 8);
	});

	it('should return a base62 subset of characters by default.', function () {
		assert((/[a-zA-Z0-9]*/).test(randString()));
	});

	it('should use default dictionary if an invalid one is provided.', function () {
		assert(((/[a-zA-Z0-9]{4}/)).test(randString(4, null)));
		assert(((/[a-zA-Z0-9]{4}/)).test(randString(4, '')));
	});

	it('should use a provided dictionary.', function () {
		assert(((/[ab]{4}/)).test(randString(4, 'ab')));
		assert(((/[Random]{4}/)).test(randString(4, 'Random')));
	});

	it('should generate a "random" string.', function () {
		assert.notStrictEqual(randString(), randString());
		assert.notStrictEqual(randString(4), randString(4));
		assert.notStrictEqual(randString(16, 'ab'), randString(16, 'ab'));
	});
});
