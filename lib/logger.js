const winston = require('winston');

const logger = new winston.Logger({});

const enableLogs = process.env.NODE_ENV === 'development' ||
	!!process.env.ENABLE_THREADNEEDLE_LOGS;

logger.add(winston.transports.Console, {
	colorize: true,
	level: enableLogs
		? 'info'
		: 'warning'
});

logger.setLevels({
	emerg: 0,
	alert: 1,
	crit: 2,
	error: 3, // tweaked from default
	warning: 4,
	notice: 5,
	info: 6,
	debug: 7 // moved down
});

module.exports = logger;
