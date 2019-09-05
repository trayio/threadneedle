/*
* Run the global `beforeRequest` method, and then the local method.
*/
const when = require('when');
const _    = require('lodash');

const localOnly = require('./localOnly');

const REFERENCE_MODIFICATION_ERROR_MESSAGE = 'Modification by reference is deprecated. `beforeRequest` must return the modified object.';

function validateForObject (referencedRequest, originalRequestCopy) {
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

    .then(validateForObject(request, originalRequest))

    .then((globalRequestResult = request) => {
        return when(( config.before ? config.before(globalRequestResult) : globalRequestResult ));
    })

    .then(validateForObject(request, originalRequest));

};

// var when = require('when');
// var _    = require('lodash');
//
// var localOnly = require('./localOnly');
//
// module.exports = function (config, request, params) {
//   var threadneedle = this;
//   return when.promise(function (resolve, reject) {
//
//     when()
//
//     // Run global promise first
//     .then(function () {
//       if (_.isFunction(threadneedle._globalOptions.beforeRequest) && !localOnly(config, 'beforeRequest')) {
//         return when(threadneedle._globalOptions.beforeRequest(request, params));
//       }
//     })
//
//     // Then run the local prmoise
//     .then(function () {
//       if (_.isFunction(config.beforeRequest)) {
//         return when(config.beforeRequest(request, params));
//       }
//     })
//
//     .then(function () {
//       return request;
//     })
//
//     .done(resolve, reject);
//
//   });
// };
