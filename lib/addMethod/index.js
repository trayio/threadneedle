const _ = require('lodash');

const addMethodREST = require('./addMethodREST');
const addMethodSOAP = require('./addMethodSOAP');

const INVALID_TYPE_ERROR_MESSAGE = `\`type\` must be strings 'REST' or 'SOAP'`;
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
		// global type must be default for method if type is not explictly set
		globalType.toLowerCase() === 'soap' ? globalType.toLowerCase() : 'rest'
	);

	if (methodConfigType) {
		/*	TODO: v2 - refactor add method to use method's type, instead of having
			the two addMethods handle opposite one-off cases */
		validateAndGetType(addMethodArgs);
	}

	switch (targetType) {
		case 'rest': return addMethodREST.call(this, ...addMethodArgs);
		case 'soap': return addMethodSOAP.call(this, ...addMethodArgs);
		default:
			throw new Error(`'Invalid type'`);
	}
};
