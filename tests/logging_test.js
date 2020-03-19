const assert = require('assert');
const resnap = require('resnap');

describe('Logging', () => {
	let restore;
	beforeEach(() => {
		restore = resnap();
	});
	afterEach(() => {
		restore();
	});
	describe('Should log for development mode', () => {
		before(() => {
			process.env.NODE_ENV = 'development';
		});
		after(() => {
			process.env.NODE_ENV = 'test';
		});
		it('Should call logger', () => {
			const logger = require('../lib/logger');
			assert.equal(logger.transports.console.level, 'info');
		});
	});
	describe('Should log for logs enabled mode', () => {
		before(() => {
			process.env.ENABLE_TN_LOGS = 'true';
		});
		after(() => {
			delete process.env.ENABLE_TN_LOGS;
		});
		it('Should call logger', () => {
			const logger = require('../lib/logger');
			assert.equal(logger.transports.console.level, 'info');
		});
	});
	describe('Should not log for no mode', () => {
		it('Should not call logger', () => {
			const logger = require('../lib/logger');
			assert.equal(logger.transports.console.level, 'warning');
		});
	});
});
