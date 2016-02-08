var assert       = require('assert');
var _            = require('lodash');
var ThreadNeedle = require('../');

describe('Global settings', function () {

  describe('#global', function () {

    it('should set the global settings', function () {
      var threadneedle = new ThreadNeedle();
      threadneedle.global({
        chris: 'test'
      });
      assert.deepEqual(threadneedle._globalOptions, { 
        chris: 'test'
      });
    });

  });


});