var when               = require('when');
var needle             = require('needle');
var _                  = require('lodash');
var setParam           = require('mout/queryString/setParam');
var utils              = require('../utils');
var substitute         = require('./substitute');
var validateInput      = require('./validateInput');
var validateExpects    = require('./validateExpects');
var validateNotExpects = require('./validateNotExpects');



module.exports = function (methodName, config) {

  var threadneedle = this;

  // Validate the input. Errors will be `throw`n if there's anything
  // wrong. Throwing is usually bad - but this is declarative, so will happen
  // on app startup;
  validateInput.call(this, methodName, config);

  // Create the method
  threadneedle[methodName] = function (params) {

    /*
      Override - if a function is provided as config, then simply run it - don't run HTTP requests.
      It should expect a promise returned by the function. Pass the context
    */
    if (_.isFunction(config)) {
      var fnPromise = config.call(threadneedle, params, utils);
      if (!_.isFunction(fnPromise.done)) {
        throw new Error('Method `'+methodName+'` returns a function that isn\'t a valid promise.');
      } else {
        return fnPromise;
      }
    }

    return when.promise(function (resolve, reject) {

      // Kick off that promise chain
      when()

      // Run a `before` if set on the params.
      .then(function () {
        if (_.isFunction(config.before)) {
          return when(config.before(params));
        } else {
          return params;
        }
      })

      // Do the main request
      .then(function (params) {
        return when.promise(function (resolve, reject) {

          /** Set a bunch of local variables, formatted and templated **/

          // Method, always lowercased
          var method = config.method.toLowerCase();

          // The URL endpoint. Query parameters allowed from here.
          var url = substitute(config.url, params, utils);

          // The request options, substituted 
          var options = substitute(config.options || {}, params, utils);

          // Add query parameters intelligently, without conflicting from query parameters
          // already specified in the URL.
          if (_.isObject(config.query)) {
            _.each(config.query, function (value, key) {
              url = setParam(url, substitute(value, params, utils));
            });
          }

          // Post/put/delete data
          var data = (method === 'get') ? substitute(config.query || {}, params, utils) : substitute(config.data || {}, params, utils);

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
      })

      // Handle the after success and failure messages
      .done(function (body) {
        if (_.isFunction(config.afterSuccess)) {
          when(config.afterSuccess(body)).done(resolve, reject); // TODO right way to handle rejections?
        } else {
          resolve(body);
        }
      }, function (err) {
        if (_.isFunction(config.afterFailure)) {
          when(config.afterFailure(err)).done(reject, reject); // TODO right way to handle rejections?
        } else {
          reject(err);
        }
      });

    });
  };

};