/*
* Run the global `before` method, and then the local method.
*
* Note that this is most often used to set/update parameters in the `params`
* object - need to ensure that variables are passed and saved correctly in the
* tests pre substitution.
*/
const when = require('when');
const _ = require('lodash');

const localOnly = require('./localOnly');
const validateObjectArgumentByReference = require('./validateObjectArgumentByReference');

const referenceValidator = validateObjectArgumentByReference(
	'Modification by reference is deprecated. `before` must return the modified object.',
	'`before` must return an object'
);

module.exports = function (config, params = {}) {

	const { _globalOptions } = this;

	const validateResult = referenceValidator(params);

	//Start by executing globalBefore if provided and globals true
	const globalBeforeExec = (
		_.isFunction(_globalOptions.before) && !localOnly(config, 'before') ?
		_globalOptions.before(params) :
		params
	);

	return when(globalBeforeExec)

	.then(validateResult)

	.then((globalParamsResult = params) => {
		return when(( config.before ? config.before(globalParamsResult) : globalParamsResult ));
	})

	.then(validateResult);

};
