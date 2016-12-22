// Normalise the expects input, converting from shorthand if needed.
// Works for both `expects` and `notExpects`.
var _ = require('lodash');

module.exports = function (input) {

    // Function - allow for manual function call to run
    if (_.isFunction(input)) {
        return input;
    }

    var expects = {};

    // Shorthand: list of status codes
    if (_.isArray(input) && input.length && _.isNumber(input[0])) {
        expects.statusCode = input;
    }

    // Shorthand: individual status code
    else if (_.isNumber(input)) {
        expects.statusCode = [input];
    }

    // Shorthand: list of bodies
    else if (_.isArray(input) && input.length && _.isString(input[0])) {
        expects.body = input;
    }

    // Shorthand: individual body string
    else if (_.isString(input)) {
        console.log(input);
        if (input === '20x' || input === '2xx') {
            expects.statusCode = [];
            var limit = ( input === '20x' ? 210 : 300 );
            for (var expectsCounter = 200; expectsCounter < limit; expectsCounter++)
                expects.statusCode.push(expectsCounter);
            console.log(expects.statusCode);
        } else expects.body = [input];
    }

    // Longhand - ensuring, that fields are arrays
    else if (_.isObject(input)) {
        _.each(_.pick(input, ['statusCode', 'body']), function (value, key) {
            expects[key] = (_.isArray(value)) ? value : [value];
        });
    }

    return expects;

};
