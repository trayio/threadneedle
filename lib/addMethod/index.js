var when               = require('when');
var needle             = require('needle');
var _                  = require('lodash');
var setParam           = require('mout/queryString/setParam');
var substitute         = require('./substitute');
var validateInput      = require('./validateInput');
var validateExpects    = require('./validateExpects');
var validateNotExpects = require('./validateNotExpects');



module.exports = function (methodName, config) {

  // Validate the input. Errors will be `throw`n if there's anything
  // wrong. Throwing is usually bad - but this is declarative, so will happen
  // on app startup;
  validateInput.call(this, methodName, config);

  // Create the method
  this[methodName] = function (params) {

    /*
      Override - if a function is provided as config, then simply run it - don't run HTTP requests.
      It should expect a promise returned by the function.
    */
    if (_.isFunction(config)) {
      var fnPromise = config(params);
      if (!_.isFunction(fnPromise.done)) {
        throw new Error('Method `'+methodName+'` returns a function that isn\'t a valid promise.');
      } else {
        return fnPromise;
      }
    }

    return when.promise(function (resolve, reject) {

      /** Set a bunch of local variables, formatted and templated **/

      // Method, always lowercased
      var method = config.method.toLowerCase();

      // The URL endpoint. Query parameters allowed from here.
      var url = substitute(config.url, params);

      // The request options, substituted 
      var options = substitute(config.options || {}, params);

      // Add query parameters intelligently, without conflicting from query parameters
      // already specified in the URL.
      if (_.isObject(config.query)) {
        _.each(config.query, function (value, key) {
          url = setParam(url, substitute(value, params));
        });
      }

      // Post/put/delete data
      var data = (method === 'get') ? substitute(config.query || {}, params) : substitute(config.data || {}, params);

      var handleResponse = function (err, res, body) {
        if (err) {
          reject(err);
        }

        else {

          var validationError;

          // Validate `expects`
          validationError = validateExpects(res, config.expects);
          if (validationError) {
            return reject(validationError);
          }

          // Validate `notExpects`
          validationError = validateNotExpects(res, config.notExpects);
          if (validationError) {
            return reject(validationError);
          }

          // If valid, then all good!
          resolve(body);

        }
      };

      // console.log(options);

      // Run a different method for get to not include data
      if (method === 'get') {
        needle.get(url, options, handleResponse);
      } else {
        needle[method](url, data, options, handleResponse);
      }

    });
  };

};