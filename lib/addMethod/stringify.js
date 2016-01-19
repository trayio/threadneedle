var _ = require('lodash');

module.exports = function (input) {
  if (_.isObject(input)) {
    return JSON.stringify(input);
  } else {
    return String(input);
  }
};