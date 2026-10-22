const assert = require('assert');

const formatResponse = require('../lib/addMethod/formatResponse');
const logger = require('../lib/logger');

describe('#formatResponse', function () {

	it('should wrap the headers and body', function () {
		assert.deepEqual(formatResponse({ 'x-test': '1' }, { ok: true }), {
			headers: { 'x-test': '1' },
			body: { ok: true }
		});
	});

	it('should replace headers that are not an object with an empty object, and warn', function () {
		const originalWarning = logger.warning;
		const warnings = [];
		logger.warning = function (message) {
			warnings.push(message);
		};

		let result;
		try {
			result = formatResponse('not an object', { ok: true });
		} finally {
			logger.warning = originalWarning;
		}

		assert.deepEqual(result, {
			headers: {},
			body: { ok: true }
		});
		assert.deepEqual(warnings, ['headers must be an object']);
	});

});
