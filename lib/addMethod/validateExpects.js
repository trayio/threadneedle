var _         = require('lodash');
var stringify = require('./stringify');
var emphasize = require('./emphasize');


module.exports = function (res, expects) {

  var missing; // lazy for linting

  var bodyString = stringify(res.body); 

  if (_.isFunction(expects)) {
    var fnError = expects.call(null, res);
    if (fnError) {
      return new Error(fnError);
    }
  }

  else if (_.isObject(expects) && !_.isArray(expects)) {

    // Validate against a single status code
    if (_.isNumber(expects.statusCode) && expects.statusCode !== res.statusCode) {
      return new Error('Invalid status code. Got '+emphasize(res.statusCode)+' but expected: '+emphasize(expects.statusCode));
    }
    if (_.isArray(expects.statusCode) && expects.statusCode.indexOf(res.statusCode) === -1) {
      return new Error('Invalid status code. Got '+emphasize(res.statusCode)+' but expected: '+emphasize(expects.statusCode, 'or')); 
    }
    if (expects.body) {

      // Convert anything to a string. JSON.stringify is a pretty sure fire way of doing it.
      if (_.isString(expects.body)) {
        if (bodyString.indexOf(expects.body) === -1) {
          return new Error('Invalid body response. Could not find '+emphasize(expects.body)+' in the response: ' + bodyString);
        }
      }

      else if (_.isArray(expects.body)) {
        missing = _.filter(expects.body, function (expected) {
          return (bodyString.indexOf(expected) === -1);
        });
        if (missing.length) {
          return new Error('Invalid body response. Could not find ' + emphasize(missing, 'and') + ' in the response: ' + bodyString);
        }
      }

    }

  }

  // Handle shorthand status code specified 
  else if (_.isNumber(expects) && res.statusCode !== expects) {
    return new Error('Invalid status code. Got '+emphasize(res.statusCode)+' but expected: '+emphasize(expects));
  }

  // Handle shorehand body specified
  else if (_.isString(expects) && bodyString.indexOf(expects) === -1) {
    return new Error('Invalid body response. Could not find '+emphasize(expects)+' in the response: ' + bodyString);
  }

  // Handle shorthand status codes and body in array
  else if (_.isArray(expects) && expects.length) {

    if (_.isNumber(expects[0]) && expects.indexOf(res.statusCode) === -1) {
      return new Error('Invalid status code. Got '+emphasize(res.statusCode)+' but expected: '+emphasize(expects, 'or')); 
    }

    else if (_.isString(expects[0])) {
      missing = _.filter(expects, function (expected) {
        return (bodyString.indexOf(expected) === -1);
      });
      if (missing.length) {
        return new Error('Invalid body response. Could not find '+emphasize(missing, 'and')+' in the response: ' + bodyString);
      }
    }

  }


};

