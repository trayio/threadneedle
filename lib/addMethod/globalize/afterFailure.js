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
        var localOnly = config.globals === false || _.get(config, 'globals.afterFailure', true) === false;
        if (_.isFunction(threadneedle._globalOptions.afterFailure) && !localOnly) {
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
