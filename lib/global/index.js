const _ = require('lodash');

module.exports = function (options) {
	const { type } = options;
	if (!_.isUndefined(type) && _.isString(type)) {
		const lowerCaseType = type.toLowerCase();
		switch (lowerCaseType) {
			case 'rest':
			case 'soap':
				options.type = lowerCaseType;
				break;
			default:
				options.type = this._globalOptions.type;
		}
	} else {
		options.type = this._globalOptions.type;
	}
	this._globalOptions = {
		...this._globalOptions,
		...options
	};
};
