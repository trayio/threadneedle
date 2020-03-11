var winston = require('winston');


var logger = winston.createLogger({});

// Log into the console
logger.add(new winston.transports.Console((function(opts) {
      const newOpts = {};
      const formatArray = [];
      const formatOptions = {
        stringify: () => winston.format((info) => { info.message = JSON.stringify(info.message); })(),
        formatter: () => winston.format((info) => { info.message = opts.formatter(Object.assign(info, opts)); })(),
        json: () => winston.format.json(),
        raw: () => winston.format.json(),
        label: () => winston.format.label(opts.label),
        logstash: () => winston.format.logstash(),
        prettyPrint: () => winston.format.prettyPrint({depth: opts.depth || 2}),
        colorize: () => winston.format.colorize({level: opts.colorize === true || opts.colorize === 'level', all: opts.colorize === 'all', message: opts.colorize === 'message'}),
        timestamp: () => winston.format.timestamp(),
        align: () => winston.format.align(),
        showLevel: () => winston.format((info) => { info.message = info.level + ': ' + info.message; })()
      }
      Object.keys(opts).filter(k => !formatOptions.hasOwnProperty(k)).forEach((k) => { newOpts[k] = opts[k]; });
      Object.keys(opts).filter(k => formatOptions.hasOwnProperty(k) && formatOptions[k]).forEach(k => formatArray.push(formatOptions[k]()));
      newOpts.format = winston.format.combine(...formatArray);
      return newOpts;
    })({
	colorize: true,
  level: (process.env.NODE_ENV === 'development') ? 'info' : 'warning'
})));

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
