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


module.exports = function (res, expectsArr) {

  // Setup the key variables
  var statusCode  = res.statusCode;
  var bodyString  = stringify(res.body);
  var errResponse = {
    statusCode: res.statusCode,
    body: res.body
  };

  // Error to return.
  var error;

  // `expects` is an array of up to two items
  _.each(expectsArr, function (expects) {

    // If already set the error don't carry on
    if (error) {
      return;
    }

    // Run function if needed
    if (_.isFunction(expects)) {
      fnErrorMessage = expects.call(null, res);
      if (fnErrorMessage) {
        error = {
          code: 'invalid_response_function',
          response: errResponse,
          message: fnErrorMessage
        };
      }
    }


    // Check the status codes - allow for ANY of them
    if (_.isArray(expects.statusCode)) {
      if (expects.statusCode.indexOf(res.statusCode) === -1) {

        var niceErrors = {
          400: {
            code: 'bad_request',
            message: 'Bad API request. Try checking your input properties.'
          },
          401: {
            code: 'unauthorized',
            message: 'Unauthorized request. Have you added your API details correctly?'
          },
          403: {
            code: 'forbidden',
            message: 'Forbidden. Check you have the appropriate permissions to access this resource.'
          },
          404: {
            code: 'not_found',
            message: 'Not found. Looks like this has been removed.'
          }
        };

        var statusError = {
          response: errResponse,
          expects: expects,
        };

        if (niceErrors[res.statusCode]) {
          statusError.code = niceErrors[res.statusCode].code;
          statusError.message = niceErrors[res.statusCode].message;
        } else {
          statusError.code = 'invalid_response_status_code';
          statusError.message = 'Invalid response status code';
        }

        error = statusError;
      }
    }

    // Check the body strings - must have ALL of them
    if (_.isArray(expects.body)) {
      var missing = _.filter(expects.body, function (pattern) {
        return bodyString.indexOf(pattern) === -1;
      });

      if (missing.length) {
        error = {
          code: 'invalid_response_body',
          message: 'Invalid response body',
          response: errResponse,
          expects: expects
        };
      }
    }

  });

  return error;

};
