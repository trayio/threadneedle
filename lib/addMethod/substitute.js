var Mustache = require('mustache');
var _        = require('lodash');
var trim     = require('mout/string/trim');


module.exports = function (template, params, utils) {

  if (_.isFunction(template)) {
    return substituteFunction(template, params, utils);
  }

  if (_.isString(template)) {
    return substituteString(template, params, utils);
  }

  else if (_.isArray(template)) {
    return substituteArray(template, params, utils);
  }

  else if (_.isObject(template)) {
    return substituteObject(template, params, utils);
  }

};

function substituteFunction(template, params, utils) {
  return template.call(null, params, utils);
}

function substituteString(template, params, utils) {

  // Smart substitution. If there's a single variable that's been substituted
  // into a field (which is what happens most of the time), then extract the key
  // and return the real value.
  var openingBrackets = template.match(/{{/g);
  var closingBrackets = template.match(/}}/g);

  if (_.isArray(openingBrackets) && openingBrackets.length === 1 &&
      _.isArray(closingBrackets) && closingBrackets.length === 1) {
    var key = trim(template.replace(/({{)|(}})/g, ''));
    if (!_.isUndefined(params[key]) && params[key] !== '') {
      return params[key];
    }
  }

  // If the above isn't the case, then template it with Mustache.
  var str =  Mustache.render(template, params);

  return (str === '') ? undefined : str;

}

function substituteArray(template, params, utils) {
  return _.map(template, function (value) {
    if (_.isString(value)) {
      return substituteString(value, params, utils);
    } else if (_.isObject(value)) {
      return substituteObject(value, params, utils);
    } else {
      return value;
    }
  });
}


function substituteObject(template, params, utils) {
  var output = {};
  _.each(template, function (value, key) {
    // console.log(value, key);
    if (_.isFunction(value)) {
      output[key] = substituteFunction(value, params, utils);
    } else if (_.isString(value)) {
      output[key] = substituteString(value, params, utils);
    } else if (_.isObject(value)) {
      output[key] = substituteObject(value, params, utils);
    } else {
      output[key] = value;
    }
  });
  return output;
}
