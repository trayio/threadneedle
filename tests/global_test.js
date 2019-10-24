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



	});

});
