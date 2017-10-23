var _ = require('lodash');

module.exports = function () {
  var threadneedle = {
    // The key method
    addMethod: require('./addMethod'),

    // Global hook to set global options below
    global: require('./global'),

    // Default global settings (can be overridden)
    _globalOptions: {
      expects: {
        statusCode: '2xx'
      }
    }
  };

  return threadneedle;
};
