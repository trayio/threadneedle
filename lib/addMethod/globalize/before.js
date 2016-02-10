/*
* Run the global `before` method, and then the local method.
* 
* Note that this is most often used to set/update parameters in the `params`
* object - need to ensure that variables are passed and saved correctly in the 
* tests pre substitution.
*/
var when = require('when');
var _    = require('lodash');


module.exports = function (before, params) {
  var threadneedle = this;
  return when.promise(function (resolve, reject) {

    when()

    // Run global promise first
    .then(function () {
      if (_.isFunction(threadneedle._globalOptions.before)) {
        return when(threadneedle._globalOptions.before(params));
      }
    })

    // Then run the local prmoise
    .then(function () {
      if (_.isFunction(before)) {
        return when(before(params));
      }
    })

    .then(function () {
      return params;
    })

    .done(resolve, reject);

  });
};