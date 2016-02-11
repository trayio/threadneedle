var assert       = require('assert');
var _            = require('lodash');
var when         = require('when');
var globalize    = require('../lib/addMethod/globalize');


describe('#globalize', function () {

  describe('#url', function () {

    it('should add the global url on the front unless it starts with http(s)://', function () {
      var sample = {
        _globalOptions: {
          url: 'http://mydomain.com'
        }
      };

      assert.strictEqual(
        globalize.url.call(sample, { url: '/mypath' }, {}),
        'http://mydomain.com/mypath'
      );

      assert.strictEqual(
        globalize.url.call(sample, { url: 'http://yourdomain.com/mypath' }, {}),
        'http://yourdomain.com/mypath'
      );

      assert.strictEqual(
        globalize.url.call(sample, { url: 'https://yourdomain.com/mypath' }, {}),
        'https://yourdomain.com/mypath'
      );
    });

    it('should substitute parameters to string urls', function () {
      var sample = {
        _globalOptions: {
          url: 'http://{{dc}}.mydomain.com'
        }
      };

      assert.strictEqual(
        globalize.url.call(sample, { url: '/mypath/{{id}}' }, {
          dc: 'us5',
          id: '123'
        }),
        'http://us5.mydomain.com/mypath/123'
      );
    });

    it('should substitute parameters to function urls', function () {
      var sample = {
        _globalOptions: {
          url: function (params) {
            return 'http://'+params.dc+'.mydomain.com';
          }
        }
      };

      assert.strictEqual(
        globalize.url.call(sample, {
          url: function(params) {
            return '/mypath/' + params.id;
          }
        }, {
          dc: 'us5',
          id: '123'
        }),
        'http://us5.mydomain.com/mypath/123'
      );
    });

  });

  describe('#object', function () {

    it('should globalize to an object on a shallow level', function () {
      var sample = {
        _globalOptions: {
          data: {
            id: '123',
            name: 'Chris'
          }
        }
      };

      assert.deepEqual(
        globalize.object.call(sample, 'data', {
          data: {
            age: 25,
            height: 180
          }
        }, {}), {
          id: '123',
          name: 'Chris',
          age: 25,
          height: 180
        }
      );
    });

    it('should globalize to an object on a deep level', function () {
      var sample = {
        _globalOptions: {
          data: {
            id: '123',
            name: 'Chris',
            height: {
              m: 1.9
            }
          }
        }
      };

      assert.deepEqual(
        globalize.object.call(sample, 'data', {
          data: {
            age: 25,
            height: {
              cm: 180,
              m: 1.8
            }
          }
        }, {}), {
          id: '123',
          name: 'Chris',
          age: 25,
          height: {
            cm: 180,
            m: 1.8
          }
        }
      );
    });

    it('should substitute to an global object on a deep level', function () {
      var sample = {
        _globalOptions: {
          data: {
            id: '123',
            firstName: '{{firstName}}',
            lastName: '{{lastName}}'
          }
        }
      };

      assert.deepEqual(
        globalize.object.call(sample, 'data', {
          data: {
            name: '{{name}}'
          }
        }, {
          name: 'Chris Houghton',
          firstName: 'Chris',
          lastName: 'Houghton'
        }), {
          id: '123',
          name: 'Chris Houghton',
          firstName: 'Chris',
          lastName: 'Houghton'
        }
      );
    });

  });


  describe('#before', function () {

    it('should run the global before method when declared', function (done) {
      var sample = {
        _globalOptions: {
          before: function (params) {
            params.dc = 'us5';
          }
        }
      };

      globalize.before.call(sample, {}, {
        url: '/mydomain'
      }).done(function (params) {
        assert.deepEqual(params, { url: '/mydomain', dc: 'us5' });
        done();
      });
    });

    it('should allow for a global promise async', function (done) {
      var sample = {
        _globalOptions: {
          before: function (params) {
            return when.promise(function (resolve, reject) {
              params.dc = 'us5';
              resolve();
            });
          }
        }
      };

      globalize.before.call(sample, {}, {
        url: '/mydomain'
      }).done(function (params) {
        assert.deepEqual(params, { url: '/mydomain', dc: 'us5' });
        done();
      });
    }); 

    it('should call the global promise before the local one', function (done) {
      var calledFirst;
      var calls = 0;

      var sample = {
        _globalOptions: {
          before: function (params) {
            if (!calledFirst) calledFirst = 'global';
            calls++;
          }
        }
      };

      globalize.before.call(sample, {
        before: function() {
          if (!calledFirst) calledFirst = 'local';
          calls++
        }
      }, {}).done(function(params) {
        assert.equal(calledFirst, 'global');
        assert.equal(calls, 2);
        done();
      });
    });

  });

  describe.skip('#beforeRequest', function () {


  });


  describe('#expects', function () {

    it('should set the expects object when specified in global', function () {
      var sample = {
        _globalOptions: {
          expects: 200
        }
      };
      assert.deepEqual(globalize.expects.call(sample, {}), { statusCode: [200] });

      var sample = {
        _globalOptions: {
          expects: {
            statusCode: [200, 201],
            body: 'chris'
          }
        }
      };
      assert.deepEqual(globalize.expects.call(sample, {}), { 
        statusCode: [200, 201],
        body: ['chris']
      });
    });

    it('should be overridden by the local config', function () {
      var sample = {
        _globalOptions: {
          expects: 200
        }
      };
      assert.deepEqual(globalize.expects.call(sample, {
        expects: {
          statusCode: 201  
        }
      }), { 
        statusCode: [201] 
      });

      assert.deepEqual(globalize.expects.call(sample, {
        expects: 202
      }), { 
        statusCode: [202] 
      });
    });

  });

  describe('#notExpects', function () {

    it('should set the expects object when specified in global', function () {
      var sample = {
        _globalOptions: {
          notExpects: 200
        }
      };
      assert.deepEqual(globalize.notExpects.call(sample, {}), { statusCode: [200] });

      var sample = {
        _globalOptions: {
          notExpects: {
            statusCode: [200, 201],
            body: 'chris'
          }
        }
      };
      assert.deepEqual(globalize.notExpects.call(sample, {}), { 
        statusCode: [200, 201],
        body: ['chris']
      });
    });

    it('should be overridden by the local config', function () {
      var sample = {
        _globalOptions: {
          notExpects: 200
        }
      };
      assert.deepEqual(globalize.notExpects.call(sample, {
        notExpects: {
          statusCode: 201  
        }
      }), { 
        statusCode: [201] 
      });

      assert.deepEqual(globalize.notExpects.call(sample, {
        notExpects: 202
      }), { 
        statusCode: [202] 
      });
    });

  });


  describe('#afterSuccess', function () {

    it('should run the global before method when declared', function (done) {
      var sample = {
        _globalOptions: {
          afterSuccess: function (body) {
            body.success = true;
          }
        }
      };

      globalize.afterSuccess.call(sample, {}, {}).done(function (body) {
        assert.deepEqual(body, { success: true });
        done();
      });
    });

    it('should allow for a global promise async', function (done) {
      var sample = {
        _globalOptions: {
          afterSuccess: function (body) {
            return when.promise(function (resolve, reject) {
              body.success = true;
              resolve();
            });
          }
        }
      };

      globalize.afterSuccess.call(sample, {}, {}).done(function (body) {
        assert.deepEqual(body, { success: true });
        done();
      });
    }); 

    it('should call the global promise before the local one', function (done) {
      var calledFirst;
      var calls = 0;

      var sample = {
        _globalOptions: {
          afterSuccess: function (params) {
            if (!calledFirst) calledFirst = 'global';
            calls++;
          }
        }
      };

      globalize.afterSuccess.call(sample, {
        afterSuccess: function() {
          if (!calledFirst) calledFirst = 'local';
          calls++
        }
      }, {}).done(function(params) {
        assert.equal(calledFirst, 'global');
        assert.equal(calls, 2);
        done();
      });
    });

  });

  describe('#afterFailure', function () {

    it('should run the global before method when declared', function (done) {
      var sample = {
        _globalOptions: {
          afterFailure: function (err) {
            err.code = 'oauth_refresh';
          }
        }
      };

      globalize.afterFailure.call(sample, {}, {}).done(function (err) {
        assert.deepEqual(err, { code: 'oauth_refresh' });
        done();
      });
    });

    it('should allow for a global promise async', function (done) {
      var sample = {
        _globalOptions: {
          afterFailure: function (err) {
            return when.promise(function (resolve, reject) {
              err.code = 'oauth_refresh';
              resolve();
            });
          }
        }
      };

      globalize.afterFailure.call(sample, {}, {}).done(function (err) {
        assert.deepEqual(err, { code: 'oauth_refresh' });
        done();
      });
    }); 

    it('should call the global promise before the local one', function (done) {
      var calledFirst;
      var calls = 0;

      var sample = {
        _globalOptions: {
          afterFailure: function () {
            if (!calledFirst) calledFirst = 'global';
            calls++;
          }
        }
      };

      globalize.afterFailure.call(sample, {
        afterFailure: function() {
          if (!calledFirst) calledFirst = 'local';
          calls++
        }
      }, {}).done(function() {
        assert.equal(calledFirst, 'global');
        assert.equal(calls, 2);
        done();
      });
    });


  });

});
