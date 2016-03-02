/*
* Run the global and local `afterFailure` method.
*/
var when = require('when');
var _    = require('lodash');


module.exports = function (config, err) {
  var threadneedle = this;
  return when.promise(function (resolve, reject) {

    when()

    // Run global promise first
    .then(function () {
      if (_.isFunction(threadneedle._globalOptions.afterFailure) && config.globals !== false) {
        return when(threadneedle._globalOptions.afterFailure(err));
      }
    })

    // Then run the local prmoise
    .then(function (result) {
      if (result) {
        err = result;
      }

      if (_.isFunction(config.afterFailure)) {
        return when(config.afterFailure(err));
      }
    })

    .then(function (result) {
      if (result) {
        err = result;
      }

      return err;
    })

    .done(resolve, reject);

  });
};