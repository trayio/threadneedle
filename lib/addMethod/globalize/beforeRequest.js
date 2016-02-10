/*
* Run the global `beforeRequest` method, and then the local method.
*/
var when = require('when');
var _    = require('lodash');


module.exports = function (beforeRequest, request) {
  var threadneedle = this;
  return when.promise(function (resolve, reject) {

    when()

    // Run global promise first
    .then(function () {
      if (_.isFunction(threadneedle._globalOptions.beforeRequest)) {
        return when(threadneedle._globalOptions.beforeRequest(request));
      }
    })

    // Then run the local prmoise
    .then(function () {
      if (_.isFunction(beforeRequest)) {
        return when(beforeRequest(request));
      }
    })

    .then(function () {
      return request;
    })

    .done(resolve, reject);

  });
};