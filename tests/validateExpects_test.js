var assert          = require('assert');
var _               = require('lodash');
var validateExpects = require('../lib/addMethod/validateExpects');


describe('#validateExpects', function () {

  it('it should be ok with valid status codes', function () {
    var err = validateExpects({
      statusCode: 201
    }, {
      statusCode: 201
    });
    assert(_.isUndefined(err));

    var err = validateExpects({
      statusCode: 201
    }, {
      statusCode: [201, 204]
    });
    assert(_.isUndefined(err));

    var err = validateExpects({
      statusCode: 201
    }, 201);
    assert(_.isUndefined(err));
  });

  it('it should not be ok with invalid status codes', function () {
    var err = validateExpects({
      statusCode: 201
    }, {
      statusCode: 202
    });
    assert(_.isObject(err));
    assert.equal(err.code, 'invalid_response_status_code');
    assert.equal(err.message, 'Invalid response status code');

    var err = validateExpects({
      statusCode: 201
    }, {
      statusCode: [202, 204]
    });
    assert(_.isObject(err));
    assert.equal(err.code, 'invalid_response_status_code');
    assert.equal(err.message, 'Invalid response status code');

    var err = validateExpects({
      statusCode: 201
    }, 204);
    assert(_.isObject(err));
    assert.equal(err.code, 'invalid_response_status_code');
    assert.equal(err.message, 'Invalid response status code');
  });


  it('it should be ok with valid bodies', function () {
    var err = validateExpects({
      body: {
        result: 'chris'
      }
    }, {
      body: 'chris'
    });
    assert(_.isUndefined(err));

    var err = validateExpects({
      body: {
        result: 'chris'
      }
    }, {
      body: ['chris', 'result']
    });
    assert(_.isUndefined(err));

    var err = validateExpects({
      body: {
        result: 'chris'
      }
    }, 'chris');
    assert(_.isUndefined(err));
  });

  it('it should not be ok with invalid bodies', function () {
    var err = validateExpects({
      body: {
        result: 'chris'
      }
    }, {
      body: 'christopher'
    });
    assert(_.isObject(err));
    assert.equal(err.code, 'invalid_response_body');
    assert.equal(err.message, 'Invalid response body');

    var err = validateExpects({
      body: {
        result: 'chris'
      }
    }, {
      body: ['chris', 'superresult']
    });
    assert(_.isObject(err));
    assert.equal(err.code, 'invalid_response_body');
    assert.equal(err.message, 'Invalid response body');

    var err = validateExpects({
      body: {
        result: 'chris'
      }
    }, 'christopher');
    assert(_.isObject(err));
    assert.equal(err.code, 'invalid_response_body');
    assert.equal(err.message, 'Invalid response body');
  });
  

});
