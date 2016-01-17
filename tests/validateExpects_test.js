var assert          = require('assert');
var _               = require('lodash');
var validateExpects = require('../lib/addMethod/validateExpects');


describe('#validateExpects', function () {

  it('should validate status code check', function () {
    var err = validateExpects({
      statusCode: 201
    }, {
      statusCode: 200
    });
    assert(_.isError(err));
    assert.equal(err.message, 'Invalid status code. Got 201 but expected: 200');
  });

  it('should validate multiple status code allowed check', function () {
    var err = validateExpects({
      statusCode: 201
    }, {
      statusCode: [204, 202]
    });
    assert(_.isError(err));
    assert.equal(err.message, 'Invalid status code. Got 201 but expected: 204 or 202');
  });

  it.skip('should validate shorthand status code', function () {
    var err = validateExpects({
      statusCode: 201
    }, 200);
    assert(_.isError(err));
    assert.equal(err.message, 'Invalid status code. Got 201 but expected: 200');
  }); 

  // it('should validate shorthand body', function () {
  //   var err = validateExpects({
  //     statusCode: 201
  //   }, 200);
  //   assert(_.isError(err));
  //   assert.equal(err.message, 'Invalid status code. Got 201 but expected: 200');
  // }); 

});
