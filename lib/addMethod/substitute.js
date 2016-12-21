var Mustache = require('mustache');
var _        = require('lodash');
var trim     = require('mout/string/trim');


module.exports = evaluateAndProcess;

function evaluateAndProcess (template, params) {

    if (_.isFunction(template)) return substituteFunction(template, params);

    if (_.isString(template))   return substituteString(template, params);

    if (_.isArray(template))    return substituteArray(template, params);

    if (_.isObject(template))   return substituteObject(template, params);

    return template;

}

function substituteFunction(template, params) {
    return template.call(null, params);
}

function substituteString(template, params) {

    // Smart substitution. If there's a single variable that's been substituted
    // into a field (which is what happens most of the time), then extract the key
    // and return the real value.
    var openingBrackets = template.match(/{{/g),
        closingBrackets = template.match(/}}/g);

    var openingState = _.isArray(openingBrackets) && openingBrackets.length === 1,
        closingState = _.isArray(closingBrackets) && closingBrackets.length === 1;

    if (openingState && closingState) {
        var key = trim(template.replace(/({{)|(}})/g, ''));
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
    var output = {};
    _.each(template, function (value, key) {
        output[key] = evaluateAndProcess(value, params);
    });
    return output;
}
