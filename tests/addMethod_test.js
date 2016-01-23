var assert       = require('assert');
var _            = require('lodash');
var express      = require('express');
var bodyParser   = require('body-parser');
var randString   = require('mout/random/randString');
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


  });

});
