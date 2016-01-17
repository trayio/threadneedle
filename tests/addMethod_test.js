var assert       = require('assert');
var _            = require('lodash');
var ThreadNeedle = require('../');


describe('#addMethod', function () {

  describe('Validation', function () {

    var threadneedle;
    beforeEach(function () {
      threadneedle = new ThreadNeedle();
    });

    it('should error when `methodName` isn\'t provided', function () {
      var caught = 0;
      try {
        threadneedle.addMethod();  
      } catch (err) {
        assert.strictEqual(err.message, 'The first parameter passed to `addMethod` should be a string.');
        caught++;
      }

      try {
        threadneedle.addMethod(true);  
      } catch (err) {
        assert(err.message, 'The first parameter passed to `addMethod` should be a string.');
        caught++;
      }

      assert.strictEqual(caught, 2);
    });


    it('should error when a method already exists for that name', function () {
      var caught = 0;
      try {
        threadneedle.addMethod('addMethod', {
          url: 'http://yourdomain.com',
          method: 'get'
        });
      } catch (err) {
        assert.strictEqual(err.message, 'Method `addMethod` has already been declared.');
        caught++;
      }
      assert.strictEqual(caught, 1);
    });

    it('should error when a url isn\'t declared', function () {
      var caught = 0;
      try {
        threadneedle.addMethod('createList', {})
      } catch (err) {
        assert.strictEqual(err.message, 'The `url` config parameter should be declared.');
        caught++;
      }
      assert.strictEqual(caught, 1);
    });

    it('should error when the method is invalid', function () {
      var caught = 0;
      try {
        threadneedle.addMethod('createList', {
          url: 'http://yourdomain.com',
          method: 'chris'
        })
      } catch (err) {
        assert.strictEqual(err.message, 'The `method` "chris" is not a valid method. Allowed methods are: get, put, post, delete, head, patch');
        caught++;
      }
      assert.strictEqual(caught, 1);
    });


  });

});
