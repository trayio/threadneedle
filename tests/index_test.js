var assert       = require('assert');
var _            = require('lodash');
var ThreadNeedle = require('../');


describe('ThreadNeedle', function () {

  it('the class should be a function', function () {
    assert(_.isFunction(ThreadNeedle));
  });

  it('should return an instance with the key methods', function () {
    var threadneedle = new ThreadNeedle();
    assert(_.isObject(threadneedle));
    assert(_.isFunction(threadneedle.addMethod));
    assert(_.isFunction(threadneedle.global));
  });

});