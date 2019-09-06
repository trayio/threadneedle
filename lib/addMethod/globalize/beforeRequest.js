/*
* Run the global `beforeRequest` method, and then the local method.
*/
const when = require('when');
const _    = require('lodash');

const localOnly = require('./localOnly');

const REFERENCE_MODIFICATION_ERROR_MESSAGE = 'Modification by reference is deprecated. `beforeRequest` must return the modified object.';

function validateResult (referencedRequest, originalRequestCopy) {
    /*
        If function returns undefined, then assume no modification to
        original params, and so set as default argument
    */
    return (returnedRequest) => {
        if (_.isUndefined(returnedRequest)) {
            if (!_.isEqual(referencedRequest, originalRequestCopy)) {
                if (process.env.NODE_ENV === 'development') {
                    throw new Error(REFERENCE_MODIFICATION_ERROR_MESSAGE);
                } else {
                    console.warn(REFERENCE_MODIFICATION_ERROR_MESSAGE);
                }
            }
        } else if (!_.isPlainObject(returnedRequest)) {
            throw new Error('`beforeRequest` must return an object');
        }
        return returnedRequest || originalRequestCopy;
    };
}

module.exports = function (config, request = {}) {

    const { _globalOptions } = this;

    const originalRequest = _.cloneDeep(request);

    //Start by executing globalBefore if provided and globals true
    const globalRequestExec = (
    	_.isFunction(_globalOptions.beforeRequest) && !localOnly(config, 'beforeRequest') ?
    	_globalOptions.beforeRequest(request) :
    	request
    );

    return when(globalRequestExec)

    .then(validateResult(request, originalRequest))

    .then((globalRequestResult = request) => {
        return when(( config.before ? config.before(globalRequestResult) : globalRequestResult ));
    })

    .then(validateResult(request, originalRequest));

};
