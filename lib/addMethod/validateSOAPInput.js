var _ = require('lodash');

module.exports = function (methodName, config) {

    // Ensure the minimum parameters have been passed
    if (!methodName || !_.isString(methodName)) {
        throw new Error('The first parameter passed to `addMethod` should be a string.');
    }
    // If a function is inputted as the `config`, then just return - there's
    // really not much to validate.
    if (_.isFunction(config)) {
        return;
    }
    if (!config || !_.isObject(config)) {
        throw new Error('The `config` object should be an object.');
    }

    // Check to see if the method has already been declared
    if (!_.isUndefined(this[methodName])) {
        throw new Error('Method `'+methodName+'` has already been declared.');
    }

    // Ensure the config parameters have been specified correctly
    if (!config.method) {
        throw new Error('The `method` config parameter should be declared.');
    }

    if (!_.isUndefined(config.expects) && !_.isFunction(config.expects)) {
        throw new Error('The `expects` config parameter must be a function if provided.');
    }
    if (!_.isUndefined(config.notExpects) && !_.isFunction(config.notExpects)) {
        throw new Error('The `notExpects` config parameter must be a function if provided.');
    }

};
