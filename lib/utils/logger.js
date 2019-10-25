const _ = require('lodash');
const winston = require('winston');

const logger = new (winston.Logger)({
	levels: _.assign(winston.config.syslog.levels, {
		'Threadneedle warning': 1,
		'Threadneedle info': 6
	})
});

winston.addColors({
	'Threadneedle warning': 'red',
	'Threadneedle info': 'green'
});
logger.add(winston.transports.Console, {
	colorize: true
});


module.exports = {
	info: (...infoMsg) => {
		logger['Threadneedle info'](...infoMsg);
	},
	warning: (...warningMsg) => {
		logger['Threadneedle warning'](...warningMsg);
	}
};
