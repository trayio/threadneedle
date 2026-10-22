const assert = require('assert');
const _ = require('lodash');
const ThreadNeedle = require('../');

const { handleDevFlagTest } = require('./testUtils.js');

describe('Global settings', function () {

	describe('#global', function () {

		it('type should be `rest` by default', function () {
			const threadneedle = new ThreadNeedle();
			assert.deepEqual(threadneedle._globalOptions, {
				type: 'rest'
			});
		});

		it('should set the global settings', function () {
			const threadneedle = new ThreadNeedle();
			threadneedle.global({
				chris: 'test'
			});
			assert.deepEqual(threadneedle._globalOptions, {
				type: 'rest',
				chris: 'test'
			});
		});

		it('should override default if `type` is defined and valid', function () {
			const threadneedle = new ThreadNeedle();
			threadneedle.global({
				type: 'SOAP'
			});
			assert.deepEqual(threadneedle._globalOptions, {
				type: 'soap'
			});
		});

		handleDevFlagTest('should error if soap flag is used in development mode', function () {
			try {
				const threadneedle = new ThreadNeedle(true);
				assert.fail('Did not error for SOAP flag usage in dev mode.');
			} catch (soapFlagError) {
				assert(soapFlagError.message.includes('`soap` flag has been deprecated. Use `type: \'SOAP\'` instead.'));
			}
		});

		it('should warn, not error, if soap flag is used outside development mode', function () {
			const originalWarn = console.warn;
			const warnings = [];
			console.warn = function (message) {
				warnings.push(message);
			};

			let threadneedle;
			try {
				threadneedle = new ThreadNeedle(true);
			} finally {
				console.warn = originalWarn;
			}

			assert.strictEqual(threadneedle._globalOptions.type, 'soap');
			assert.strictEqual(warnings.length, 1);
			assert(warnings[0].includes('`soap` flag has been deprecated. Use `type: \'SOAP\'` instead.'));
		});

		it('should keep the current type if `type` is not a string', function () {
			const threadneedle = new ThreadNeedle();
			threadneedle.global({
				type: 5
			});
			assert.deepEqual(threadneedle._globalOptions, {
				type: 'rest'
			});
		});

		it('should keep the current type if `type` is defined but invalid', function () {
			const threadneedle = new ThreadNeedle();
			threadneedle.global({
				type: 'SOAP'
			});
			threadneedle.global({
				type: 'graphql',
				chris: 'test'
			});
			assert.deepEqual(threadneedle._globalOptions, {
				type: 'soap',
				chris: 'test'
			});
		});



	});

});
