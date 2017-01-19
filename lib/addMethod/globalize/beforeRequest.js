/*
* Run the global `beforeRequest` method, and then the local method.
*/
var when = require('when');
var _    = require('lodash');


module.exports = function (config, request, params) {
  var threadneedle = this;
  return when.promise(function (resolve, reject) {

    when()

    // Run global promise first
    .then(function () {
      if (_.isFunction(threadneedle._globalOptions.beforeRequest) && !require('./localOnly')(config, 'beforeRequest')) {
        return when(threadneedle._globalOptions.beforeRequest(request, params));
      }
    })

    // Then run the local prmoise
    .then(function () {
      if (_.isFunction(config.beforeRequest)) {
        return when(config.beforeRequest(request, params));
      }
    })

    .then(function () {
      return request;
    })

    .done(resolve, reject);

  });
};
