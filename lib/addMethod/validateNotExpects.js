/*
* Validate a response vs not expected status codes and body.
* 
* When something is not right, an __object__ is returned, containing 
* full details on the response and how it compared to the not expected values.
* Sample object:

  {

    // Arbitrary human readable message
    message: 'Invalid status code',

    // slimmed down version of the `res` that was actually returned
    response: {
      statusCode: 201,
      body: { 
        created: true
      }
    },

    // the normalised `notExpects` object
    `notExpects`: {
      statusCode: 202,
      body: {
        created: false
      }
    }

  }

*/

var _                = require('lodash');
var stringify        = require('./stringify');
var normalizeExpects = require('./normalizeExpects');


module.exports = function (res, expectsInput) {

  // Setup the key variables
  var statusCode  = res.statusCode;
  var bodyString  = stringify(res.body); 
  var notExpects  = normalizeExpects(expectsInput);
  var errResponse = {
    statusCode: res.statusCode, 
    body: res.body
  };

  // Array of errors objects to build up
  var errors = [];

  // Run function if needed
  if (_.isFunction(notExpects)) {
    fnErrorMessage = notExpects.call(null, res);
    if (fnErrorMessage) {
      return {
        response: errResponse,
        notExpects: notExpects.toString(), // try to be helpful
        message: fnErrorMessage
      };
    }
  }


  // Check the status codes - must have NONE of them
  if (_.isArray(notExpects.statusCode)) {
    if (notExpects.statusCode.indexOf(res.statusCode) !== -1) {
      return {
        message: 'Invalid response status code',
        response: errResponse,
        notExpects: notExpects
      };
    } 
  }

  // Check the body strings - must have NONE of them
  if (_.isArray(notExpects.body)) {
    var found = _.filter(notExpects.body, function (pattern) {
      return bodyString.indexOf(pattern) !== -1;
    });

    if (found.length) {
      return {
        message: 'Invalid response body',
        response: errResponse,
        notExpects: notExpects
      };
    }
  }

};


