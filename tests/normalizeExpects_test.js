var assert           = require('assert');
var _                = require('lodash');
var normalizeExpects = require('../lib/addMethod/normalizeExpects');


describe('#normalizeExpects', function () {

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

  it('should be ok for shorthand statusCode string 20x', function () {
    assert.deepEqual(normalizeExpects('20x'), { statusCode: [200, 201, 202, 203, 204, 205, 206, 207, 208, 209] });
  });

  it('should be ok for shorthand statusCode string 2xx', function () {
    assert.deepEqual(normalizeExpects('2xx'), { statusCode: [200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299] });
  });

  it('should be ok for shorthand status code list', function () {
    assert.deepEqual(normalizeExpects(['chris', 'steph']), { body: ['chris', 'steph'] });
  });

  it('should allow a function', function () {
    assert(_.isFunction(normalizeExpects(function() { console.log('test') })));
  });


});
