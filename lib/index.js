const _ = require('lodash');

const SOAP_FLAG_DEPRECATION_WARNING = '`soap` flag has been deprecated. Use `type: \'SOAP\'` instead.';

module.exports = function (soapFlag) {

	if (_.isBoolean(soapFlag) && soapFlag) {
		if (process.env.NODE_ENV === 'development') {
			throw new Error(SOAP_FLAG_DEPRECATION_WARNING);
		} else {
			//eslint-disable-next-line no-console
			console.warn(SOAP_FLAG_DEPRECATION_WARNING);
		}
	}

	const threadneedle = {

		// The key method
		addMethod: require('./addMethod'),

		// Global hook to set global options below
		global: require('./global'),

		// Default global settings (can be overridden)
		_globalOptions: {

			//default type is rest. soapFlag used for backward compatibility
			type: ( soapFlag ? 'soap' : 'rest' )

			//TODO: Threadneedle v2: default to '2xx' for REST; breaking change

		}

	};

	return threadneedle;

};
