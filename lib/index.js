var _ = require('lodash');

module.exports = function () {

  var threadneedle = {

    addMethod: require('./addMethod'),

    addMethodsInDirectory: require('./addMethodsInDirectory'),

    utils: require('./utils')

  };


  return threadneedle;

};


