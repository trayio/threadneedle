const _ = require('lodash');

const addMethodREST = require('./addMethodREST');
const addMethodSOAP = require('./addMethodSOAP');

const INVALID_TYPE_ERROR_MESSAGE = '`type` must be strings \'REST\' or \'SOAP\'';
function validateAndGetType ([ methodName, config ]) {
	const { type } = config;

	if (!_.isString(type)) {
		throw new Error(`${methodName}: ${INVALID_TYPE_ERROR_MESSAGE}`);
	}
	const lowerCaseType = type.toLowerCase();
	switch (lowerCaseType) {
		case 'rest':
		case 'soap':
			return lowerCaseType;
		default:
			throw new Error(`${methodName}: ${INVALID_TYPE_ERROR_MESSAGE}`);
	}
}

module.exports = function (...addMethodArgs) {

	const { type: globalType } = this._globalOptions;
	const methodConfigType = _.get(addMethodArgs, '[1].type', undefined);

	const targetType = (
		/*
			Need to specify soap if global type is soap for backwards
			compatibility. Remove in Threadneedle v2 and allow operation to
			specify type regardless of global default.
		*/
		globalType === 'soap' ?
		globalType :
		( methodConfigType ? validateAndGetType(addMethodArgs) : globalType )

	);

	switch (targetType) {
		case 'rest': return addMethodREST.call(this, ...addMethodArgs);
		case 'soap': return addMethodSOAP.call(this, ...addMethodArgs);
		default:
			throw new Error(`'Invalid type'`);
	}

};
