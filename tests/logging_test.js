const assert = require('assert');

describe('Logging', () => {
	beforeEach(() => {
		delete require.cache[require.resolve('../lib/logger.js')];
	});
	describe('Should log for development mode', () => {

		beforeEach(() => {
			process.env.NODE_ENV = 'development';
		});
		afterEach(() => {
			process.env.NODE_ENV = 'test';
		});

		it('Should set logger level to info', () => {
			const logger = require('../lib/logger');
			assert.equal(logger.transports.console.level, 'info');
		});
	});
	describe('Should log for logs enabled mode', () => {

		beforeEach(() => {
			process.env.ENABLE_THREADNEEDLE_LOGS = 'true';
		});
		afterEach(() => {
			delete process.env.ENABLE_THREADNEEDLE_LOGS;
		});

		it('Should set logger level to info', () => {
			const logger = require('../lib/logger');
			assert.equal(logger.transports.console.level, 'info');
		});
	});
	describe('Should not log for no mode', () => {
		it('Should set logger level to warning', () => {
			const logger = require('../lib/logger');
			assert.equal(logger.transports.console.level, 'warning');
		});
	});
});
