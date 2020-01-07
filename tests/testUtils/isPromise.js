const _ = require('lodash');

module.exports = function (targetFunction) {
	return targetFunction.constructor.name === 'AsyncFunction' || _.isFunction(targetFunction.then);
};
