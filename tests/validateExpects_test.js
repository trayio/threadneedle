var assert          = require('assert');
var _               = require('lodash');
var validateExpects = require('../lib/addMethod/validateExpects');


describe('#validateExpects', function () {
  
  describe('Status code', function () {

    it('should validate status code check: ok', function () {
      var err = validateExpects({
        statusCode: 201
      }, {
        statusCode: 201
      });
      assert(_.isUndefined(err));
    });

    it('should validate status code check: error', function () {
      var err = validateExpects({
        statusCode: 201
      }, {
        statusCode: 200
      });
      assert(_.isError(err));
      assert.equal(err.message, 'Invalid status code. Got "201" but expected: "200"');
    });

    it('should validate multiple status code allowed check: ok', function () {
      var err = validateExpects({
        statusCode: 201
      }, {
        statusCode: [204, 202]
      });
      assert(_.isError(err));
      assert.equal(err.message, 'Invalid status code. Got "201" but expected: "204" or "202"');
    });

    it('should validate multiple status code allowed check: error', function () {
      var err = validateExpects({
        statusCode: 204
      }, {
        statusCode: [204, 202]
      });
      assert(_.isUndefined(err));
    });

    it('should validate shorthand status code: ok', function () {
      var err = validateExpects({
        statusCode: 200
      }, 200);
      assert(_.isUndefined(err));
    }); 

    it('should validate shorthand status code: error', function () {
      var err = validateExpects({
        statusCode: 201
      }, 200);
      assert(_.isError(err));
      assert.equal(err.message, 'Invalid status code. Got "201" but expected: "200"');
    }); 

    it('should validate shorthand status code as array: ok', function () {
      var err = validateExpects({
        statusCode: 200
      }, [200]);
      assert(_.isUndefined(err));

      var err = validateExpects({
        statusCode: 201
      }, [202, 201, 200]);
      assert(_.isUndefined(err));
    }); 

    it('should validate shorthand status code as array: error', function () {
      var err = validateExpects({
        statusCode: 201
      }, [200]);
      assert(_.isError(err));
      assert.equal(err.message, 'Invalid status code. Got "201" but expected: "200"');

      var err = validateExpects({
        statusCode: 201
      }, [204, 202]);
      assert(_.isError(err));
      assert.equal(err.message, 'Invalid status code. Got "201" but expected: "204" or "202"');
    }); 

  });


  describe('Body', function () {

    it('should validate body with expected body: ok', function () {
      var err = validateExpects({
        body: {
          result: true
        }
      }, {
        body: 'true'
      });
      assert(_.isUndefined(err));
    });

    it('should validate body with expected body: error', function () {
      var err = validateExpects({
        body: {
          result: false
        }
      }, {
        body: 'true'
      });
      assert(_.isError(err));
      assert.equal(err.message, 'Invalid body response. Could not find "true" in the response: {"result":false}');
    });

    it('should validate body with expected body array: ok', function () {
      var err = validateExpects({
        body: {
          result: false
        }
      }, {
        body: ['false', 'result']
      });
      assert(_.isUndefined(err));

      var err = validateExpects({
        body: {
          result: false
        }
      }, {
        body: ['false']
      });
      assert(_.isUndefined(err));
    });

    it('should validate body with expected body array: error', function () {
      var err = validateExpects({
        body: {
          result: false
        }
      }, {
        body: ['christopher', 'result']
      });
      assert(_.isError(err));
      assert.equal(err.message, 'Invalid body response. Could not find "christopher" in the response: {"result":false}');

      var err = validateExpects({
        body: {
          result: false
        }
      }, {
        body: ['result', 'christopher']
      });
      assert(_.isError(err));
      assert.equal(err.message, 'Invalid body response. Could not find "christopher" in the response: {"result":false}');
    });

    it('should validate shorthand status code: ok', function () {
      var err = validateExpects({
        body: {
          result: true
        }
      }, 'result');
      assert(_.isUndefined(err));
    }); 

    it('should validate shorthand status code: error', function () {
      var err = validateExpects({
        body: {
          result: true
        }
      }, 'result2');
      assert(_.isError(err));
      assert.equal(err.message, 'Invalid body response. Could not find "result2" in the response: {"result":true}');
    }); 


    it('should validate shorthand body as array: ok', function () {
      var err = validateExpects({
        body: {
          result: false
        }
      }, ['result']);
      assert(_.isUndefined(err));

      var err = validateExpects({
        body: {
          result: false
        }
      }, ['false', 'resu']);
      assert(_.isUndefined(err));
    }); 

    it('should validate shorthand body as array: error', function () {
      var err = validateExpects({
        body: {
          result: false
        }
      }, ['resultyes']);
      assert(_.isError(err));
      assert.equal(err.message, 'Invalid body response. Could not find "resultyes" in the response: {"result":false}');

      var err = validateExpects({
        body: {
          result: false
        }
      }, ['result', 'falsey']);
      assert(_.isError(err));
      assert.equal(err.message, 'Invalid body response. Could not find "falsey" in the response: {"result":false}');

      var err = validateExpects({
        body: {
          result: false
        }
      }, ['resultyes', 'falsey']);
      assert(_.isError(err));
      assert.equal(err.message, 'Invalid body response. Could not find "resultyes" and "falsey" in the response: {"result":false}');
    }); 

  });

});
