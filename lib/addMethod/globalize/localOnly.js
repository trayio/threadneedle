module.exports = function (config, key) {
	return config.globals === false || require('lodash').get(config, 'globals.' + key, true) === false;
};
