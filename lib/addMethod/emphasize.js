var _ = require('lodash');

module.exports = function (input, delimiter) {
  if (_.isArray(input)) {
    var outputArr = _.map(input, function (value) {
      return '"' + value + '"';
    });
    return outputArr.join(' ' + delimiter + ' ');
  } else {
    return '"' + input + '"';
  }
};