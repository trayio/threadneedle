/*
* Run the global `before` method, and then the local method.
*
* Note that this is most often used to set/update parameters in the `params`
* object - need to ensure that variables are passed and saved correctly in the
* tests pre substitution.
*/
const when = require('when');
const _    = require('lodash');

const localOnly = require('./localOnly');

const REFERENCE_MODIFICATION_ERROR_MESSAGE = 'Modification by reference is deprecated. `before` must return the modified object.';

function validateResult (referencedParams, originalParamsCopy) {
    /*
        If function returns undefined, then assume no modification to
        original params, and so set as default argument
    */
    return (returnedParams) => {
        if (_.isUndefined(returnedParams)) {
            if (!_.isEqual(referencedParams, originalParamsCopy)) {
                if (process.env.NODE_ENV === 'development') {
                    throw new Error(REFERENCE_MODIFICATION_ERROR_MESSAGE);
                } else {
                    console.warn(REFERENCE_MODIFICATION_ERROR_MESSAGE);
                }
            }
        } else if (!_.isPlainObject(returnedParams)) {
            throw new Error('`before` must return an object');
        }
        return returnedParams || originalParamsCopy;
    };
}

module.exports = function (config, params = {}) {

    const { _globalOptions } = this;

    const originalParams = _.cloneDeep(params);

    //Start by executing globalBefore if provided and globals true
    const globalBeforeExec = (
    	_.isFunction(_globalOptions.before) && !localOnly(config, 'before') ?
    	_globalOptions.before(params) :
    	params
    );

    return when(globalBeforeExec)

    .then(validateResult(params, originalParams))

    .then((globalParamsResult = params) => {
        return when(( config.before ? config.before(globalParamsResult) : globalParamsResult ));
    })

    .then(validateResult(params, originalParams));

};
