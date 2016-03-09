var when               = require('when');
var needle             = require('needle');
var _                  = require('lodash');
var setParam           = require('mout/queryString/setParam');
var logger             = require('../logger');
var globalize          = require('./globalize');
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

    params = params || {};

    /*
      Override - if a function is provided as config, then simply run it - don't run HTTP requests.
      It should expect a promise returned by the function. Pass the context
    */
    if (_.isFunction(config)) {

      logger.info(methodName+': Running method function.');

      var fnPromise = config.call(threadneedle, params);
      if (!_.isFunction(fnPromise.done)) {
        throw new Error('Method `'+methodName+'` returns a function that isn\'t a valid promise.');
      } else {
        return fnPromise;
      }
    }

    return when.promise(function (resolve, reject) {

      // Method, always lowercased
      var method = config.method.toLowerCase();

      // Kick off that promise chain
      when()

      // Run a `before` if set on the params.
      .then(function () {
        logger.info('Running method `'+methodName+'` `before`.');
        return globalize.before.call(threadneedle, config, params);
      })

      // Set a bunch of local variables, formatted and templated
      .then(function (params) {

        logger.info(methodName+': substituting parameters');

        // The URL endpoint. Query parameters allowed from here.
        var url = globalize.url.call(threadneedle, config, params);
        // var url = globalize.call(threadneedle, config.globals, 'url', config, params);

        // Add query parameters intelligently, without conflicting from query parameters
        // already specified in the URL.
        var query = globalize.object.call(threadneedle, 'query', config, params);
        _.each(query, function (value, key) {
          if (_.isArray(value) && value.length > 0) {
            value = value.join(',');
          }
          if (!_.isUndefined(value) && !(_.isString(value) && value === '')) {
            url = setParam(url, key, value);
          }
        });

        // The request options, substituted
        var options = globalize.object.call(threadneedle, 'options', config, params);

        // Post/put/delete data
        var data;
        if (method !== 'get') {
          data = globalize.object.call(threadneedle, 'data', config, params);
        }

        return {
          url: url,
          data: data,
          options: options
        };
      })

      // Run the `beforeRequest`
      .then(function (request) {
        logger.info(methodName+': running `beforeRequest` hook');
        return globalize.beforeRequest.call(threadneedle, config, request);
      })

      // Run the actual request
      .then(function (request) {
        return when.promise(function (resolve, reject) {

          var handleResponse = function (err, res, body) {
            if (err) {
              reject(err);
            }

            else {

              logger.info(methodName+': got response', res.statusCode, JSON.stringify(body));

              var validationError;

              // Validate `expects`
              var expects = globalize.expects.call(threadneedle, config);
              validationError = validateExpects(res, expects);
              if (validationError) {
                return reject(validationError);
              }

              // Validate `notExpects`
              var notExpects = globalize.notExpects.call(threadneedle, config);
              validationError = validateNotExpects(res, notExpects);
              if (validationError) {
                return reject(validationError);
              }

              // If valid, then all good!
              resolve(body);

            }
          };

          // console.log(options);

          logger.info(methodName+': running '+method+' request', request);

          // Run a different method for get to not include data
          if (method === 'get') {
            needle.get(request.url, request.options, handleResponse);
          } else {
            needle[method](request.url, request.data, request.options, handleResponse);
          }

        });
      })

      // Handle the after success and failure messages
      .done(function (body) {
        logger.info(methodName+': running `afterSuccess` hook');
        globalize.afterSuccess.call(threadneedle, config, body, params).done(resolve, reject);
      }, function (err) {
        logger.info(methodName+': running `afterFailure` hook', err);
        globalize.afterFailure.call(threadneedle, config, err, params).done(reject, reject);
      });

    });
  };

};
