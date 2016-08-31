var assert          = require('assert');
var _               = require('lodash');
var validateExpects = require('../lib/addMethod/validateExpects');


describe('#validateExpects', function () {

  it('should be ok with valid status codes', function () {
    var err = validateExpects({
      statusCode: 201
    }, [{
      statusCode: [201, 204]
    }]);
    assert(_.isUndefined(err));
  });

  it('should not be ok with invalid status codes', function () {
    var err = validateExpects({
      statusCode: 201
    }, [{
      statusCode: [202]
    }]);
    assert(_.isObject(err));
    assert.equal(err.code, 'invalid_response_status_code');
    assert.equal(err.message, 'Invalid response status code');

    var err = validateExpects({
      statusCode: 201
    }, [{
      statusCode: [202, 204]
    }]);
    assert(_.isObject(err));
    assert.equal(err.code, 'invalid_response_status_code');
    assert.equal(err.message, 'Invalid response status code');
  });


  it('should make the errors nicely for certain invalid status codes', function () {
    _.each([400, 401, 403, 404], function (statusCode) {

      var err = validateExpects({
        statusCode: statusCode
      }, [{
        statusCode: [202]
      }]);
      assert(_.isObject(err));
      assert(err.code.length);
      assert(err.message.length);
      assert.notEqual(err.code, 'invalid_response_status_code');
      assert.notEqual(err.message, 'Invalid response status code');

    });
  });


  it('it should be ok with valid bodies', function () {
    var err = validateExpects({
      body: {
        result: 'chris'
      }
    }, [{
      body: ['chris']
    }]);
    assert(_.isUndefined(err));

    var err = validateExpects({
      body: {
        result: 'chris'
      }
    }, [{
      body: ['chris', 'result']
    }]);
    assert(_.isUndefined(err));
  });

  it('it should not be ok with invalid bodies', function () {
    var err = validateExpects({
      body: {
        result: 'chris'
      }
    }, [{
      body: ['christopher']
    }]);
    assert(_.isObject(err));
    assert.equal(err.code, 'invalid_response_body');
    assert.equal(err.message, 'Invalid response body');

    var err = validateExpects({
      body: {
        result: 'chris'
      }
    }, [{
      body: ['chris', 'superresult']
    }]);
    assert(_.isObject(err));
    assert.equal(err.code, 'invalid_response_body');
    assert.equal(err.message, 'Invalid response body');
  });

  it('should not be ok if a function returns an error', function () {
    var err = validateExpects({
      body: {
        result: 'chris'
      }
    }, [function (res) {
      return 'Bad things';
    }]);
    assert(_.isObject(err));
    assert.equal(err.code, 'invalid_response_function');
    assert.equal(err.message, 'Bad things');

    var err = validateExpects({
      body: {
        result: 'chris'
      }
    }, [function (res) {}, function () {
      return 'Very bad things';
    }]);
    assert(_.isObject(err));
    assert.equal(err.code, 'invalid_response_function');
    assert.equal(err.message, 'Very bad things');
  });


});
