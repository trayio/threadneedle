var _ = require('lodash');

module.exports = function (res, expects) {

  if (_.isObject(expects) && !_.isArray(expects)) {

    // Validate against a single status code
    if (_.isNumber(expects.statusCode) && expects.statusCode !== res.statusCode) {
      return new Error('Invalid status code. Got '+res.statusCode+' but expected: '+expects.statusCode);
    }
    if (_.isArray(expects.statusCode) && expects.statusCode.indexOf(res.statusCode) === -1) {
      return new Error('Invalid status code. Got '+res.statusCode+' but expected: '+expects.statusCode.join(' or ')); 
    }


  }

  // Handle shorthand status code specified 
  // if (_.isNumber(expects) && res.statusCode !== expects) {
  //   return new Error('Invalid status code. Got '+res.statusCode+' but expected: '+expects);
  // }


};