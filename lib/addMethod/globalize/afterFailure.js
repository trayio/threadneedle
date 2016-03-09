/*
* Run the global and local `afterSuccess` method.
*/
var when = require('when');
var _    = require('lodash');


module.exports = function (config, body, params) {
  var threadneedle = this;
  return when.promise(function (resolve, reject) {

    when()

    // Run global promise first
    .then(function () {
      if (_.isFunction(threadneedle._globalOptions.afterFailure) && config.globals !== false) {
        return when(threadneedle._globalOptions.afterFailure(body, params));
      }
    })

    // Then run the local prmoise
    .then(function (result) {

      // if result returned, set body as that. If not,
      // assume that the `body` has been manipulated
      if (result) {
        body = result;
      }


      if (_.isFunction(config.afterFailure)) {
        return when(config.afterFailure(body, params));
      }
    })

    .then(function (result) {

      // if result returned, set body as that. If not,
      // assume that the `body` has been manipulated
      if (result) {
        body = result;
      }


      return body;
    })

    .done(resolve, reject);

  });
};
