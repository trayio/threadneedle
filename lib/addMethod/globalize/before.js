/*
* Run the global `before` method, and then the local method.
*
* Note that this is most often used to set/update parameters in the `params`
* object - need to ensure that variables are passed and saved correctly in the
* tests pre substitution.
*/
var when = require('when');
var _    = require('lodash');


module.exports = function (config, params) {
  var threadneedle = this;
  return when.promise(function (resolve, reject) {

    when()

    // Run global promise first
    .then(function () {
        var localOnly = config.globals === false || _.get(config, 'globals.before', true) === false;
        if (_.isFunction(threadneedle._globalOptions.before) && !localOnly) {
        return when(threadneedle._globalOptions.before(params));
        }
    })

    // Then run the local prmoise
    .then(function () {
      if (_.isFunction(config.before)) {
        return when(config.before(params));
      }
    })

    .then(function () {
      return params;
    })

    .done(resolve, reject);

  });
};
