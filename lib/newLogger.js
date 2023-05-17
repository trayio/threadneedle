const winston = require('winston');

const logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.simple()
	),
	levels: {
		emerg: 0,
		alert: 1,
		crit: 2,
		error: 3, // tweaked from default
		warning: 4,
		notice: 5,
		info: 6,
		debug: 7 // moved down
	}
});

const enableLogs = process.env.NODE_ENV === 'development' ||
	!!process.env.THREADNEEDLE_ENABLE_LOGS;

const enableRequestResponse = enableLogs ||
	!!process.env.THREADNEEDLE_ENABLE_REQUEST_RESPONSE;

logger.add(new winston.transports.Console({
	colorize: true,
	level: enableLogs
			? 'debug'
			: enableRequestResponse ? 'info' : 'warning'
}));

function debug (message) {
	logger.debug(message);
}

function requestResponse (message) {
	logger.info(message);
}

module.exports = {
	debug,
	requestResponse
};
