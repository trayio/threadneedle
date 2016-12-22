var assert           = require('assert');
var _                = require('lodash');
var normalizeExpects = require('../lib/addMethod/normalizeExpects');


describe.only('#normalizeExpects', function () {

  it('should be ok for a single status code', function () {
    assert.deepEqual(normalizeExpects({ statusCode: 200 }), { statusCode: [200 ]});
  });

  it('should be ok for multiple status codes', function () {
    assert.deepEqual(normalizeExpects({ statusCode: [200, 201] }), { statusCode: [200, 201]});
  });

  it('should be ok for a single body', function () {
    assert.deepEqual(normalizeExpects({ body: 'chris' }), { body: ['chris']});
  });

  it('should be ok for multiple status codes', function () {
    assert.deepEqual(normalizeExpects({ body: ['chris', 'steve'] }), { body: ['chris', 'steve']});
  });

  it('should be ok for both', function () {
    assert.deepEqual(normalizeExpects({ statusCode: 200, body: 'chris' }), { statusCode: [200], body: ['chris']});
  });

  it('should be ok for shorthand status code', function () {
    assert.deepEqual(normalizeExpects(200), { statusCode: [200] });
  });

  it('should be ok for shorthand status code list', function () {
    assert.deepEqual(normalizeExpects([200, 202]), { statusCode: [200, 202] });
  });

  it('should be ok for shorthand body', function () {
    assert.deepEqual(normalizeExpects('chris'), { body: ['chris'] });
  });

  it('should be ok for shorthand statusCode string', function () {
    assert.deepEqual(normalizeExpects('20x'), { statusCode: [200, 201, 202, 203, 204, 205, 206, 207, 208, 209] });
  });

  it('should be ok for shorthand status code list', function () {
    assert.deepEqual(normalizeExpects(['chris', 'steph']), { body: ['chris', 'steph'] });
  });

  it('should allow a function', function () {
    assert(_.isFunction(normalizeExpects(function() { console.log('test') })));
  });


});
