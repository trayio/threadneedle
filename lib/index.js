const _ = require('lodash');

module.exports = function (soapFlag) {

	const threadneedle = {

		// The key method
		addMethod: require('./addMethod')(soapFlag),

		// Global hook to set global options below
		global: require('./global'),

		// Default global settings (can be overridden)
		_globalOptions: {

			type: 'rest' //default type

			//TODO: Threadneedle v2: default to '2xx' for REST; breaking change

		}

	};

	return threadneedle;

};
