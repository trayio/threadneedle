const assert = require('assert');
const proxyquire = require('proxyquire');
const winston = require('winston');
let loggedDebugMessages = [];
let loggedInfoMessages = [];
let actualLoggerTransport = undefined;
const mockLogger = {
	add: (transport) => { actualLoggerTransport = transport; },
	debug: (message) => { loggedDebugMessages.push(message); },
	info: (message) => { loggedInfoMessages.push(message); }
};
const winstonStub = {
	createLogger: () => { return mockLogger; }
};

const loadLogger = () => { return proxyquire('../lib/newLogger', { 'winston': winstonStub }); };


describe('newLogger', () => {
	beforeEach(() => {
		loggedDebugMessages = [];
		loggedInfoMessages = [];
		delete process.env.THREADNEEDLE_ENABLE_LOGS;
		delete process.env.THREADNEEDLE_ENABLE_REQUEST_RESPONSE;
		delete require.cache[require.resolve('../lib/newLogger.js')];
	});


	afterEach(() => {
		delete process.env.THREADNEEDLE_ENABLE_LOGS;
		delete process.env.THREADNEEDLE_ENABLE_REQUEST_RESPONSE;
		delete require.cache[require.resolve('../lib/newLogger.js')];
	});

	it('should use debug level when logging is enabled', () =>{
		process.env.THREADNEEDLE_ENABLE_LOGS = 'true';

		const logger = loadLogger();

		assert.equal(actualLoggerTransport.level, 'debug');
	});

	it('should use info level when request-response is enabled', () =>{
		process.env.THREADNEEDLE_ENABLE_REQUEST_RESPONSE = 'true';

		const logger = loadLogger();

		assert.equal(actualLoggerTransport.level, 'info');
	});

	it('should use warning level when request-response is disabled', () =>{
		const logger = loadLogger();

		assert.equal(actualLoggerTransport.level, 'warning');
	});

	it('can log debug message', () => {
		const logger = loadLogger();

		logger.debug('debug message');

		assert.equal(loggedDebugMessages, 'debug message');
	});

	it('can log requestResponse message as info', () => {
		const logger = loadLogger();
        
		logger.requestResponse('requestResponse message');

		assert.equal(loggedInfoMessages, 'requestResponse message');
	});
	
});
