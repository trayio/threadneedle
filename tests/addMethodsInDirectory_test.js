var assert       = require('assert');
var _            = require('lodash');
var ThreadNeedle = require('../');


describe('#addMethodsInDirectory', function () {

  var threadneedle;
  beforeEach(function () {
    threadneedle = new ThreadNeedle();
  });

  it('should add all the methods', function () {
    threadneedle.addMethodsInDirectory(__dirname+'/sampleMethods');
    assert(_.isFunction(threadneedle.createList));
    assert(_.isFunction(threadneedle.getLists));
  });

});