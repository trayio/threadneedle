var Mustache = require('mustache');
var _        = require('lodash');
var typecast = require('mout/string/typecast');

module.exports = function (template, params) {

  if (_.isFunction(template)) {
    return substituteFunction(template, params);
  }

  if (_.isString(template)) {
    return substituteString(template, params);
  }

  else if (_.isArray(template)) {
    return substituteArray(template, params);
  }

  else if (_.isObject(template)) {
    return substituteObject(template, params);
  }

};

function substituteFunction(template, params) {
  return template.call(null, params);
}

function substituteString(template, params) {
  return typecast(Mustache.render(template, params));
}

function substituteArray(template, params) {
  return _.map(template, function (value) {
    if (_.isString(value)) {
      return substituteString(value, params);
    } else if (_.isObject(value)) {
      return substituteObject(value, params);
    } else {
      return value;
    }
  });
} 


function substituteObject(template, params) {
  var output = {};
  _.each(template, function (value, key) {
    // console.log(value, key);
    if (_.isFunction(value)) {
      output[key] = substituteFunction(value, params);
    } else if (_.isString(value)) {
      output[key] = substituteString(value, params);
    } else if (_.isObject(value)) {
      output[key] = substituteObject(value, params);
    } else {
      output[key] = value;
    }
  });
  return output;
}