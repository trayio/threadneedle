/*
* Run the global and local `afterFailure` method.
*/
var when = require('when');
var _    = require('lodash');


module.exports = function (afterFailure, err) {
  var threadneedle = this;
  return when.promise(function (resolve, reject) {

    when()

    // Run global promise first
    .then(function () {
      if (_.isFunction(threadneedle._globalOptions.afterFailure)) {
        return when(threadneedle._globalOptions.afterFailure(err));
      }
    })

    // Then run the local prmoise
    .then(function () {
      if (_.isFunction(afterFailure)) {
        return when(afterFailure(err));
      }
    })

    .then(function () {
      return err;
    })

    .done(resolve, reject);

  });
};