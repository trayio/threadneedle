var Mustache = require('mustache');
var _        = require('lodash');
var typecast = require('mout/string/typecast');

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
  return typecast(Mustache.render(template, params));
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