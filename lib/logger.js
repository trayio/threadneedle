var winston = require('winston');


var logger = new (winston.Logger)({});

// Log into the console
logger.add(winston.transports.Console, {
	colorize: true,
  level: (process.env.NODE_ENV === 'production') ? 'notice' : 'info'
});

logger.setLevels({
  emerg: 0,
  alert: 1,
  crit: 2,
  error: 7, // tweaked from default
  warning: 4,
  notice: 5,
  info: 6,
  debug: 3 // moved down
});

module.exports = logger;