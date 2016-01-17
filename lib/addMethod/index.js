var when          = require('when');
var needle        = require('needle');
var validateInput = require('./validateInput');

module.exports = function (methodName, config) {

  // Validate the input. Errors will be `throw`n if there's anything
  // wrong.
  validateInput.call(this, methodName, config);

  // Actually add the method
  this[methodName] = function (params) {
    return when.promise(function (resolve, reject) {

      // Set a bunch of local variables, formatted and templated
      var method = config.method.toLowerCase();
      var url = substitute(config.url, params);

      console.log(url);


      if (method === 'get') {
        needle.get(config.endpoint, config.options, function (err, res, body) {

        }); 
      }

      else {
        // needle[method](config.endpoint, config.data, )
      }
      

    });
  };

};