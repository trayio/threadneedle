var _  = require('lodash');
var requireIndex = require('requireindex');

module.exports = function (dir) {

  var methodConfigs = requireIndex(dir);

  _.each(methodConfigs, function (config, key) {
    this.addMethod(key, config);
  }.bind(this));

};