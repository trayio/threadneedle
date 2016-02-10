var assert       = require('assert');
var _            = require('lodash');
var express      = require('express');
var bodyParser   = require('body-parser');
var when         = require('when');
var randString   = require('mout/random/randString');
var globalize    = require('../lib/addMethod/globalize');
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


  describe('Running', function () {

    var host = 'http://localhost:4000';
    var server;
    var app;

    before(function(done){
      app = express();
      app.use(bodyParser());
      server = app.listen(4000, done);
    });

    after(function(done){
      server.close(done);
    });

    var threadneedle;
    beforeEach(function () {
      threadneedle = new ThreadNeedle();
    });

    it('should work with a basic example', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'get',
        url: host + '/' + name,
        expects: 200
      });

      app.get('/'+name, function (req, res) {
        res.status(200).send('ok');
      }); 

      threadneedle[name]().done(function (result) {
        assert.equal(result, 'ok');
        done();
      });
    });

    it('should substitute to the url with a basic example', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'get',
        url: host + '/' + name + '?key={{apiKey}}',
        expects: 200
      });

      app.get('/'+name, function (req, res) {
        res.status(200).send(req.query.key);
      }); 

      threadneedle[name]({
        apiKey: '123'
      }).done(function (result) {
        assert.equal(result, '123');
        done();
      });
    });


    it('should substitute to the data', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'post',
        url: host + '/' + name + '?key={{apiKey}}',
        data: {
          name: '{{name}}',
          age: '{{age}}'
        },
        expects: 200
      });

      app.post('/'+name, function (req, res) {
        res.status(200).json({
          query: req.query,
          body: req.body
        });
      }); 

      threadneedle[name]({
        apiKey: '123',
        name: 'Chris',
        age: 25
      }).done(function (result) {
        assert.deepEqual(result.query, { key: '123' });
        assert.deepEqual(result.body, { name: 'Chris', age: 25 });
        done();
      });
    });

    it('should substitute to the headers', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'post',
        url: host + '/' + name,
        options: {
          headers: {
            'Authorization': 'Basic {{apiKey}}'
          }
        },
        expects: 200
      });

      app.post('/'+name, function (req, res) {
        res.status(200).json(req.headers);
      }); 

      threadneedle[name]({
        apiKey: '123'
      }).done(function (result) {
        assert.equal(result.authorization, 'Basic 123');
        done();
      });
    });

    it('should substitute to the auth', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'post',
        url: host + '/' + name,
        options: {
          username: '{{username}}',
          password: '{{password}}'
        },
        expects: 200
      });

      app.post('/'+name, function (req, res) {
        res.status(200).json(req.headers);
      }); 

      threadneedle[name]({
        username: 'chris',
        password: 'hello'
      }).done(function (result) {
        assert.equal(result.authorization, 'Basic Y2hyaXM6aGVsbG8=');
        done();
      });
    });

    it('should reject on invalid status code', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'post',
        url: host + '/' + name,
        expects: 201
      });

      app.post('/'+name, function (req, res) {
        res.status(200).json(req.headers);
      }); 

      threadneedle[name]().done(function (result) {}, function (err) {
        assert.equal(err.message, 'Invalid response status code');
        done();
      });
    });

    it('should reject on invalid status codes', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'post',
        url: host + '/' + name,
        expects: [202, 201]
      });

      app.post('/'+name, function (req, res) {
        res.status(200).json(req.headers);
      }); 

      threadneedle[name]().done(function (result) {}, function (err) {
        assert.equal(err.message, 'Invalid response status code');
        done();
      });
    });

    it('should reject on invalid body', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'post',
        url: host + '/' + name,
        expects: 'success'
      });

      app.post('/'+name, function (req, res) {
        res.status(200).json({ failure: true });
      }); 

      threadneedle[name]().done(function (result) {}, function (err) {
        assert.equal(err.message, 'Invalid response body');
        done();
      });
    });

    it('should be ok when notExpect status code is fine', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'post',
        url: host + '/' + name,
        notExpects: 201
      });

      app.post('/'+name, function (req, res) {
        res.status(200).json({ result: true });
      }); 

      threadneedle[name]().done(function (result) {
        assert.deepEqual(result, { result: true });
        done();
      });
    });

    it('should reject when notExpect status code is bad', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'post',
        url: host + '/' + name,
        notExpects: 200
      });

      app.post('/'+name, function (req, res) {
        res.status(200).json({ result: true });
      }); 

      threadneedle[name]().done(function() {}, function (err) {
        assert.equal(err.message, 'Invalid response status code');
        done();
      });
    });

    it('should be ok when notExpect body is fine', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'post',
        url: host + '/' + name,
        notExpects: 'success'
      });

      app.post('/'+name, function (req, res) {
        res.status(200).json({ result: true });
      }); 

      threadneedle[name]().done(function (result) {
        assert.deepEqual(result, { result: true });
        done();
      });
    });

    it('should reject when notExpect body is bad', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'post',
        url: host + '/' + name,
        notExpects: 'result'
      });

      app.post('/'+name, function (req, res) {
        res.status(200).json({ result: true });
      }); 

      threadneedle[name]().done(function() {}, function (err) {
        assert.equal(err.message, 'Invalid response body');
        done();
      });
    });


    it('should run `before` on the params synchronously', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'post',
        url: host + '/' + name,
        before: function (params) {
          params.name = params.firstName + ' ' + params.lastName;
          return params;
        },
        data: function (params) {
          return params;
        }
      });

      app.post('/'+name, function (req, res) {
        res.status(200).json(req.body);
      }); 

      threadneedle[name]({
        firstName: 'Chris',
        lastName: 'Houghton'
      }).done(function(result) {
        assert.deepEqual(result, {
          firstName: 'Chris',
          lastName: 'Houghton',
          name: 'Chris Houghton'
        });
        done();
      });
    });

    it('should run `before` on the params asynchronously', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'post',
        url: host + '/' + name,
        before: function (params) {
          return when.promise(function (resolve) {
            params.name = params.firstName + ' ' + params.lastName;
            resolve(params);
          });
        },
        data: function (params) {
          return params;
        }
      });

      app.post('/'+name, function (req, res) {
        res.status(200).json(req.body);
      }); 

      threadneedle[name]({
        firstName: 'Chris',
        lastName: 'Houghton'
      }).done(function(result) {
        assert.deepEqual(result, {
          firstName: 'Chris',
          lastName: 'Houghton',
          name: 'Chris Houghton'
        });
        done();
      });
    });

    it('should run `afterSuccess` on the params synchronously', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'post',
        url: host + '/' + name,
        afterSuccess: function (body) {
          return {
            age: 25
          };
        },
        data: {
          firstName: '{{firstName}}'
        }
      });

      app.post('/'+name, function (req, res) {
        res.status(200).json(req.body);
      }); 

      threadneedle[name]({
        firstName: 'Chris'
      }).done(function(result) {
        assert.deepEqual(result, { age: 25 });
        done();
      });
    });

    it('should run `afterSuccess` on the params asynchronously', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'post',
        url: host + '/' + name,
        afterSuccess: function (body) {
          return when({
            age: 25
          });
        },
        data: {
          firstName: '{{firstName}}'
        }
      });

      app.post('/'+name, function (req, res) {
        res.status(200).json(req.body);
      }); 

      threadneedle[name]({
        firstName: 'Chris'
      }).done(function(result) {
        assert.deepEqual(result, { age: 25 });
        done();
      });
    });

    it('should run `afterFailure` on the params synchronously', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'post',
        url: host + '/' + name,
        afterFailure: function (body) {
          body.code = 'oauth_refresh';
          return body;
        },
        expects: 201,
        data: {
          firstName: '{{firstName}}'
        }
      });

      app.post('/'+name, function (req, res) {
        res.status(200).json(req.body);
      }); 

      threadneedle[name]({
        firstName: 'Chris'
      }).done(function() {}, function (err) {
        assert.deepEqual(err, {
          message: 'Invalid response status code',
          response: {
            statusCode: 200,
            body: {
              firstName: 'Chris'
            }
          },
          expects: {
            statusCode: [201]
          },
          code: 'oauth_refresh'
        });
        done();
      });
    });

    it('should run `afterFailure` on the params asynchronously', function (done) {
      var name = randString(10);
      threadneedle.addMethod(name, {
        method: 'post',
        url: host + '/' + name,
        afterFailure: function (body) {
          body.code = 'oauth_refresh';
          return when(body);
        },
        expects: 201,
        data: {
          firstName: '{{firstName}}'
        }
      });

      app.post('/'+name, function (req, res) {
        res.status(200).json(req.body);
      }); 

      threadneedle[name]({
        firstName: 'Chris'
      }).done(function() {}, function (err) {
        assert.deepEqual(err, {
          message: 'Invalid response status code',
          response: {
            statusCode: 200,
            body: {
              firstName: 'Chris'
            }
          },
          expects: {
            statusCode: [201]
          },
          code: 'oauth_refresh'
        });
        done();
      });
    });


    describe('#globalize', function () {

      describe('#url', function () {

        it('should add the global url on the front unless it starts with http(s)://', function () {
          var sample = {
            _globalOptions: {
              url: 'http://mydomain.com'
            }
          };

          assert.strictEqual(
            globalize.url.call(sample, '/mypath', {}),
            'http://mydomain.com/mypath'
          );

          assert.strictEqual(
            globalize.url.call(sample, 'http://yourdomain.com/mypath', {}),
            'http://yourdomain.com/mypath'
          );

          assert.strictEqual(
            globalize.url.call(sample, 'https://yourdomain.com/mypath', {}),
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
            globalize.url.call(sample, '/mypath/{{id}}', {
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
            globalize.url.call(sample, function(params) {
              return '/mypath/' + params.id;
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
              age: 25,
              height: 180
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
              age: 25,
              height: {
                cm: 180,
                m: 1.8
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
              name: '{{name}}'
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

          globalize.before.call(sample, undefined, {
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

          globalize.before.call(sample, undefined, {
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

          globalize.before.call(sample, function () {
            if (!calledFirst) calledFirst = 'local';
            calls++
          }, {}).done(function (params) {
            assert.equal(calledFirst, 'global');
            assert.equal(calls, 2);
            done();
          });
        });

      });

      describe('#expects', function () {

        it('should set the expects object when specified in global', function () {
          var sample = {
            _globalOptions: {
              expects: 200
            }
          };
          assert.deepEqual(globalize.expects.call(sample), { statusCode: [200] });

          var sample = {
            _globalOptions: {
              expects: {
                statusCode: [200, 201],
                body: 'chris'
              }
            }
          };
          assert.deepEqual(globalize.expects.call(sample), { 
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
            statusCode: 201
          }), { 
            statusCode: [201] 
          });

          assert.deepEqual(globalize.expects.call(sample, 202), { 
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
          assert.deepEqual(globalize.notExpects.call(sample), { statusCode: [200] });

          var sample = {
            _globalOptions: {
              notExpects: {
                statusCode: [200, 201],
                body: 'chris'
              }
            }
          };
          assert.deepEqual(globalize.notExpects.call(sample), { 
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
            statusCode: 201
          }), { 
            statusCode: [201] 
          });

          assert.deepEqual(globalize.notExpects.call(sample, 202), { 
            statusCode: [202] 
          });
        });

      });


      describe.skip('#afterSuccess', function () {

      });

      describe.skip('#afterFailure', function () {

      });

    });


  });


  describe('Ad-hoc', function () {

    var threadneedle;
    beforeEach(function () {
      threadneedle = new ThreadNeedle();
    });

    it('should be fine with allowing the method config to be a function', function (done) {

      var called = false;

      threadneedle.addMethod('myCustomMethod', function (params) {

        assert(_.isObject(params));

        var self = this;

        return when.promise(function (resolve, reject) {

          assert.equal(params.name, 'Chris');
          assert.deepEqual(self, threadneedle); // context
          called = true;

          setTimeout(function () {
            resolve();
          }, 200);

        });
      });

      threadneedle.myCustomMethod({ name: 'Chris' }).done(function () {
        assert(called);
        done();
      }, function (err) {
        console.log(err);
      });

    });

  });



});
