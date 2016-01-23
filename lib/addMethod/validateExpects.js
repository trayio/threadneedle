/*
* Validate a response vs expected status codes and body.
* 
* When something is not right, an __object__ is returned, containing 
* full details on the response and how it compared to the expected values.
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

    // the normalised `expects` object
    expects: {
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
  var expects     = normalizeExpects(expectsInput);
  var errResponse = {
    statusCode: res.statusCode, 
    body: res.body
  };

  // Array of errors objects to build up
  var errors = [];

  // Run function if needed
  if (_.isFunction(expects)) {
    fnErrorMessage = expects.call(null, res);
    if (fnErrorMessage) {
      return {
        response: errResponse,
        expects: expects.toString(), // try to be helpful
        message: fnErrorMessage
      };
    }
  }


  // Check the status codes - allow for ANY of them
  if (_.isArray(expects.statusCode)) {
    if (expects.statusCode.indexOf(res.statusCode) === -1) {
      return {
        message: 'Invalid response status code',
        response: errResponse,
        expects: expects
      };
    } 
  }

  // Check the body strings - must have ALL of them
  if (_.isArray(expects.body)) {
    var missing = _.filter(expects.body, function (pattern) {
      return bodyString.indexOf(pattern) === -1;
    });

    if (missing.length) {
      return {
        message: 'Invalid response body',
        response: errResponse,
        expects: expects
      };
    }
  }

};


