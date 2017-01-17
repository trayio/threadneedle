var Mustache = require('mustache');
var _        = require('lodash');

module.exports = evaluateAndProcess;

function evaluateAndProcess (template, params) {

    if (_.isFunction(template)) return template.call(null, params);

    if (_.isString(template))   return substituteString(template, params);

    if (_.isArray(template))    return substituteArray(template, params);

    if (_.isObject(template))   return substituteObject(template, params);

    return template;

}

function substituteString(template, params) {

    // Smart substitution. If there's a single variable that's been substituted
    // into a field (which is what happens most of the time), then extract the key
    // and return the real value.
    if (template.match(/^{{([^{}]+)}}$/g)) {
        var key = _.trim(template.match(/(?!{{)([^{}]+)(?=}})/g)[0]);
        if (!_.isUndefined(params[key]) && params[key] !== '')
            return params[key];
    }

    // If the above isn't the case, then template it with Mustache.
    var str =  Mustache.render(template, params);

    return (str === '') ? undefined : str;

}

function substituteArray(template, params) {
    return _.map(template, function (value) {
        return evaluateAndProcess(value, params);
    });
}

function substituteObject(template, params) {
    //The `accumulator` variable is the output object being built
    return _.reduce(template, function (accumulator, value, key) {
        accumulator[key] = evaluateAndProcess(value, params);
        return accumulator;
    }, {});
}
