const assert = require('assert');
const proxyquire = require('proxyquire');
const winston = require('winston');
let loggedDebugMessages = [];
let loggedInfoMessages = [];
let actualLoggerTransport = undefined;
let actualLoggerOptions = undefined;
const mockLogger = {
	add: (transport) => { actualLoggerTransport = transport; },
	debug: (message) => { loggedDebugMessages.push(message); },
	info: (message) => { loggedInfoMessages.push(message); }
};
const winstonStub = {
	createLogger: (options) => { 
		actualLoggerOptions = options;
		return mockLogger; 
	}
};

const loadLogger = () => { return proxyquire('../lib/newLogger', { 'winston': winstonStub }); };

function cleanup () {
	loggedDebugMessages = [];
	loggedInfoMessages = [];
	actualLoggerTransport = undefined;
	actualLoggerOptions = undefined;
	delete process.env.THREADNEEDLE_ENABLE_LOGS;
	delete process.env.THREADNEEDLE_ENABLE_REQUEST_RESPONSE;
	delete require.cache[require.resolve('../lib/newLogger.js')];
}

describe('newLogger', () => {
	beforeEach(cleanup);

	afterEach(cleanup);

	it('Logger created with correct log levels', () =>{
		const logger = loadLogger();

		assert.equal(
			JSON.stringify(actualLoggerOptions.levels), 
			JSON.stringify({ 
				emerg: 0,
				alert: 1,
				crit: 2,
				error: 3,
				warning: 4,
				notice: 5,
				info: 6,
				debug: 7 
			})
		);
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

	it('should use warning level when neither logging flags are enabled', () =>{
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
