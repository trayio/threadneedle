/*
* Run the global and local `afterSuccess` method.
*/
var when = require('when');
var _    = require('lodash');


module.exports = function (config, body, params, res) {
  var threadneedle = this;
  return when.promise(function (resolve, reject) {

    when()

    // Run global promise first
    .then(function () {
        var localOnly = config.globals === false || _.get(config, 'globals.afterSuccess', true) === false;
        if (_.isFunction(threadneedle._globalOptions.afterSuccess) && !localOnly) {
        return when(threadneedle._globalOptions.afterSuccess(body, params, res));
        }
    })

    // Then run the local prmoise
    .then(function (result) {

      // if result returned, set body as that. If not,
      // assume that the `body` has been manipulated
      if (result) {
        body = result;
      }


      if (_.isFunction(config.afterSuccess)) {
        return when(config.afterSuccess(body, params, res));
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
