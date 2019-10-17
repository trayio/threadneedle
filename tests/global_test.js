const assert = require('assert');
const _ = require('lodash');
const ThreadNeedle = require('../');

describe('Global settings', function () {

	describe.only('#global', function () {

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

	});


});
