/*
* Run the global and local `afterSuccess` method.
*/
var when = require('when');
var _    = require('lodash');


module.exports = function (afterSuccess, body) {
  var threadneedle = this;
  return when.promise(function (resolve, reject) {

    when()

    // Run global promise first
    .then(function () {
      if (_.isFunction(threadneedle._globalOptions.afterSuccess)) {
        return when(threadneedle._globalOptions.afterSuccess(body));
      }
    })

    // Then run the local prmoise
    .then(function () {
      if (_.isFunction(afterSuccess)) {
        return when(afterSuccess(body));
      }
    })

    .then(function () {
      return body;
    })

    .done(resolve, reject);

  });
};