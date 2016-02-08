var _ = require('lodash');

module.exports = function () {

  var threadneedle = {

    addMethod: require('./addMethod'),

    _globalOptions: {},
    global: require('./global')
    
  };


  return threadneedle;

};


