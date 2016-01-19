var when               = require('when');
var needle             = require('needle');
var setParam           = require('mout/queryString/setParam');
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
    return when.promise(function (resolve, reject) {

      /** Set a bunch of local variables, formatted and templated **/

      // Method, always lowercased
      var method = config.method.toLowerCase();

      // The URL endpoint. Query parameters allowed from here.
      var url = substitute(config.url, params);

      // Add query parameters intelligently, without conflicting from query parameters
      // already specified in the URL.
      if (_.isObject(config.query)) {
        _.each(config.query, function (value, key) {
          url = setParam(url, substitute(value, params));
        });
      }

      // Post/put/delete data
      var data = (method === 'get') ? substitute(config.query || {}, params) : substitute(config.data || {}, params);


      needle.request(method, url, data, config.options || {}, function (err, res, body) {
        if (err) {
          reject(err);
        }

        else {

          var validationError;

          // Validate `expects`
          validationError = validateExpects(config.expects);
          if (validationError) {
            return reject(validationError);
          }

          // Validate `notExpects`
          validationError = validateNotExpects(config.notExpects);
          if (validationError) {
            return reject(validationError);
          }

        }
      });
    

    });
  };

};