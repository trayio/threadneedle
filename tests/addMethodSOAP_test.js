var assert       = require('assert');
var _            = require('lodash');
var when            = require('when');
var express      = require('express');
var bodyParser   = require('body-parser');
var when         = require('when');
var fs           = require('fs');
var randString   = require('mout/random/randString');
var globalize    = require('../lib/addMethod/globalize');
var ThreadNeedle = require('../');


describe.only('#addMethodSOAP', function () {

    describe('Running', function () {

        var threadneedle;

        before(function () {
            threadneedle = new ThreadNeedle(true);
            threadneedle.global({

                soap: true,

                wsdl: 'https://www.regonline.com/api/default.asmx?WSDL',

                options: {
                    headers: [{
                        value: {
                            TokenHeader: {
                                APIToken: 'lO29j0in23WRCF9s3b6LvqARu1FCIhohPTVP4Pu1yom2y2h005KRAQ=='
                            }
                        },
                        xmlns: 'http://www.regonline.com/api',
                    }]
                },

                data: {}


            });
        });

        describe('dfsfw', function () {
            this.timeout(10000);

            it('', function (done) {
                when(
                    threadneedle.addMethod(
                        'list_events',
                        {
                            method: 'GetEvents',

                            data: {
                                orderBy: 'ID DESC',
                            }
                        }
                    )
                )

                .done(
                    function (result) {
                        console.log('result dfsfw');
                        console.log(result);
                        done();
                    },
                    function (err) {
                        console.log('err');
                        console.log(err);
                        done();
                    }
                );

            });

        });

        describe('dfsfw2', function () {
            this.timeout(10000);

            it('', function (done) {
                console.log('threadneedle in test');
                console.log(threadneedle);

                when(
                    threadneedle['list_events']({})
                )

                .then(function (results) {
                    console.log('result dfsfw2');
                    console.log(results);
                })

                .done(done, done);

            });

        });

        // var host = 'http://localhost:4000';
        // var server;
        // var app;
        //
        // before(function(done){
        //     app = express();
        //     app.use(bodyParser.json());
        //     app.use(bodyParser.urlencoded());
        //     server = app.listen(4000, done);
        // });
        //
        // after(function(done){
        //     server.close(done);
        // });
        //
        // var threadneedle;
        // beforeEach(function () {
        //     threadneedle = new ThreadNeedle();
        // });
        //
        // it('should work with a basic example', function (done) {
        //     var name = randString(10);
        //     threadneedle.addMethod(name, {
        //         method: 'get',
        //         url: host + '/' + name,
        //         expects: 200
        //     });
        //
        //     app.get('/'+name, function (req, res) {
        //         res.status(200).send('ok');
        //     });
        //
        //     threadneedle[name]().done(function (result) {
        //         assert.equal(result, 'ok');
        //         done();
        //     });
        // });
        //
        // it('should substitute to the url with a basic example', function (done) {
        //     var name = randString(10);
        //     threadneedle.addMethod(name, {
        //         method: 'get',
        //         url: host + '/' + name + '?key={{apiKey}}',
        //         expects: 200
        //     });
        //
        //     app.get('/'+name, function (req, res) {
        //         res.status(200).send(req.query.key);
        //     });
        //
        //     threadneedle[name]({
        //         apiKey: '123'
        //     }).done(function (result) {
        //         assert.equal(result, '123');
        //         done();
        //     });
        // });


        // it('should substitute to the data', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name + '?key={{apiKey}}',
        // data: {
        //   name: '{{name}}',
        //   age: '{{age}}'
        // },
        // expects: 200
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json({
        //   query: req.query,
        //   body: req.body
        // });
        // });
        //
        // threadneedle[name]({
        // apiKey: '123',
        // name: 'Chris',
        // age: 25
        // }).done(function (result) {
        // assert.deepEqual(result.query, { key: '123' });
        // assert.deepEqual(result.body, { name: 'Chris', age: 25 });
        // done();
        // });
        // });
        //
        // it('should substitute to the headers', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // options: {
        //   headers: {
        //     'Authorization': 'Basic {{apiKey}}'
        //   }
        // },
        // expects: 200
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json(req.headers);
        // });
        //
        // threadneedle[name]({
        // apiKey: '123'
        // }).done(function (result) {
        // assert.equal(result.authorization, 'Basic 123');
        // done();
        // });
        // });
        //
        // it('should substitute to the auth', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // options: {
        //   username: '{{username}}',
        //   password: '{{password}}'
        // },
        // expects: 200
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json(req.headers);
        // });
        //
        // threadneedle[name]({
        // username: 'chris',
        // password: 'hello'
        // }).done(function (result) {
        // assert.equal(result.authorization, 'Basic Y2hyaXM6aGVsbG8=');
        // done();
        // });
        // });
        //
        // it('should reject on invalid status code', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // expects: 201
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json(req.headers);
        // });
        //
        // threadneedle[name]().done(function (result) {}, function (err) {
        // assert.equal(err.message, 'Invalid response status code');
        // done();
        // });
        // });
        //
        // it('should reject on invalid status codes', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // expects: [202, 201]
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json(req.headers);
        // });
        //
        // threadneedle[name]().done(function (result) {}, function (err) {
        // assert.equal(err.message, 'Invalid response status code');
        // done();
        // });
        // });
        //
        // it('should reject on invalid body', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // expects: 'success'
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json({ failure: true });
        // });
        //
        // threadneedle[name]().done(function (result) {}, function (err) {
        // assert.equal(err.message, 'Invalid response body');
        // done();
        // });
        // });
        //
        // it('should be ok when notExpect status code is fine', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // notExpects: 201
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json({ result: true });
        // });
        //
        // threadneedle[name]().done(function (result) {
        // assert.deepEqual(result, { result: true });
        // done();
        // });
        // });
        //
        // it('should reject when notExpect status code is bad', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // notExpects: 200
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json({ result: true });
        // });
        //
        // threadneedle[name]().done(function() {}, function (err) {
        // assert.equal(err.message, 'Invalid response status code');
        // done();
        // });
        // });
        //
        // it('should be ok when notExpect body is fine', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // notExpects: 'success'
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json({ result: true });
        // });
        //
        // threadneedle[name]().done(function (result) {
        // assert.deepEqual(result, { result: true });
        // done();
        // });
        // });
        //
        // it('should reject when notExpect body is bad', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // notExpects: 'result'
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json({ result: true });
        // });
        //
        // threadneedle[name]().done(function() {}, function (err) {
        // assert.equal(err.message, 'Invalid response body');
        // done();
        // });
        // });
        //
        //
        // it('should run `before` on the params synchronously', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // before: function (params) {
        //   params.name = params.firstName + ' ' + params.lastName;
        //   return params;
        // },
        // data: function (params) {
        //   return params;
        // }
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json(req.body);
        // });
        //
        // threadneedle[name]({
        // firstName: 'Chris',
        // lastName: 'Houghton'
        // }).done(function(result) {
        // assert.deepEqual(result, {
        //   firstName: 'Chris',
        //   lastName: 'Houghton',
        //   name: 'Chris Houghton'
        // });
        // done();
        // });
        // });
        //
        // it('should run `before` on the params asynchronously', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // before: function (params) {
        //   return when.promise(function (resolve) {
        //     params.name = params.firstName + ' ' + params.lastName;
        //     resolve(params);
        //   });
        // },
        // data: function (params) {
        //   return params;
        // }
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json(req.body);
        // });
        //
        // threadneedle[name]({
        // firstName: 'Chris',
        // lastName: 'Houghton'
        // }).done(function(result) {
        // assert.deepEqual(result, {
        //   firstName: 'Chris',
        //   lastName: 'Houghton',
        //   name: 'Chris Houghton'
        // });
        // done();
        // });
        // });
        //
        // it('should run `afterSuccess` on the params synchronously', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // afterSuccess: function (body) {
        //   delete body.firstName;
        //   body.age = 25;
        // },
        // data: {
        //   firstName: '{{firstName}}'
        // }
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json(req.body);
        // });
        //
        // threadneedle[name]({
        // firstName: 'Chris'
        // }).done(function(result) {
        // assert.deepEqual(result, { age: 25 });
        // done();
        // });
        // });
        //
        // it('should run `afterSuccess` on the params asynchronously', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // afterSuccess: function (body) {
        //   return when.promise(function (resolve) {
        //     body.age = 25;
        //     resolve();
        //   });
        // },
        // data: {
        //   firstName: '{{firstName}}'
        // }
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json(req.body);
        // });
        //
        // threadneedle[name]({
        // firstName: 'Chris'
        // }).done(function(result) {
        // assert.deepEqual(result, { firstName: 'Chris', age: 25 });
        // done();
        // });
        // });
        //
        // it('Should override with returned value in `afterSuccess`', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // afterSuccess: function (body) {
        //   return {
        //     data: body
        //   };
        // },
        // data: {
        //   firstName: '{{firstName}}'
        // }
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json([ req.body ]);
        // });
        //
        // threadneedle[name]({
        // firstName: 'Chris'
        // }).done(function(result) {
        // assert.deepEqual(result.data, [{ firstName: 'Chris' }]);
        // done();
        // });
        // });
        //
        // it('should run `afterFailure` on the params synchronously', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // afterFailure: function (body) {
        //   body.code = 'oauth_refresh';
        //   return body;
        // },
        // expects: 201,
        // data: {
        //   firstName: '{{firstName}}'
        // }
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json(req.body);
        // });
        //
        // threadneedle[name]({
        // firstName: 'Chris'
        // }).done(function() {}, function (err) {
        // assert.deepEqual(err, {
        //   message: 'Invalid response status code',
        //   response: {
        //     statusCode: 200,
        //     body: {
        //       firstName: 'Chris'
        //     }
        //   },
        //   expects: {
        //     statusCode: [201]
        //   },
        //   code: 'oauth_refresh'
        // });
        // done();
        // });
        // });
        //
        // it('should run `afterFailure` on the params asynchronously', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // afterFailure: function (body) {
        //   body.code = 'oauth_refresh';
        //   return when(body);
        // },
        // expects: 201,
        // data: {
        //   firstName: '{{firstName}}'
        // }
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json(req.body);
        // });
        //
        // threadneedle[name]({
        // firstName: 'Chris'
        // }).done(function() {}, function (err) {
        // assert.deepEqual(err, {
        //   message: 'Invalid response status code',
        //   response: {
        //     statusCode: 200,
        //     body: {
        //       firstName: 'Chris'
        //     }
        //   },
        //   expects: {
        //     statusCode: [201]
        //   },
        //   code: 'oauth_refresh'
        // });
        // done();
        // });
        // });
        //
        // it('Should override with returned value in `afterFailure`', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'post',
        // url: host + '/' + name,
        // expects: 201,
        // afterFailure: function (body) {
        //   return {
        //     meh: 'no error here'
        //   };
        // },
        // data: {
        //   firstName: '{{firstName}}'
        // }
        // });
        //
        // app.post('/'+name, function (req, res) {
        // res.status(200).json([ req.body ]);
        // });
        //
        // threadneedle[name]({
        // firstName: 'Chris'
        // }).done(function() {}, function (err) {
        // assert.equal(err.meh, 'no error here');
        // done();
        // });
        // });
        //
        // it('should add a {{temp_file}} parameter when `fileHandler` is true', function (done) {
        // var name = randString(10);
        // threadneedle.addMethod(name, {
        // method: 'get',
        // url: host + '/' + name,
        // fileHandler: true,
        // data: {
        //   firstName: '{{firstName}}'
        // },
        // options: {
        //   output: function (input) {
        //     // should be available pre substituations
        //     assert(input.temp_file);
        //   }
        // },
        // afterSuccess: function (body, params) {
        //   assert(params.temp_file);
        //   assert.equal(params.temp_file.indexOf('/tmp/'), 0);
        //   assert.equal(params.temp_file.length, 41);
        // }
        // });
        //
        // app.get('/'+name, function (req, res) {
        // var filePath = __dirname+'/sample-file.png';
        // var stat = fs.statSync(filePath);
        // res.writeHead(200, {
        //   'Content-Type': 'image/png',
        //   'Content-Length': stat.size
        // });
        // var readStream = fs.createReadStream(filePath);
        // readStream.pipe(res);
        // });
        //
        // threadneedle[name]({
        // firstName: 'Chris'
        // }).done(function(body) {
        // done();
        // })
        // });


    });

    describe('Ad-hoc', function () {

        it('should be fine with allowing the method config to be a function', function (done) {

            var threadneedle = new ThreadNeedle(true);

            threadneedle.addMethod(
                'myCustomMethod',
                function (params) {
                    return params.name;
                }
            );

            threadneedle.myCustomMethod({ name: 'Chris' })

            .done(
                function (val) {
                    assert(val === 'Chris');
                    done();
                },
                function (err) {
                    console.log(err);
                    assert.fail(err);
                }
            );

        });

    });

    describe('Ad-hoc from REST mode', function () {
        this.timeout(3000);

        it('should be fine with allowing a single SOAP method config from REST mode', function (done) {

            var threadneedle = new ThreadNeedle();

            threadneedle.addMethod(
                'myCustomMethod',
                function (params) {
                    return params.name;
                }
            );

            threadneedle.addMethod(
                'mySOAPMethod',
                {

                    soap: true,

                    wsdl: 'https://www.regonline.com/api/default.asmx?WSDL',

                    options: {
                        headers: [{
                            value: {
                                TokenHeader: {
                                    APIToken: 'lO29j0in23WRCF9s3b6LvqARu1FCIhohPTVP4Pu1yom2y2h005KRAQ=='
                                }
                            },
                            xmlns: 'http://www.regonline.com/api',
                        }]
                    },

                    method: 'GetEvents',

                    data: {
                        orderBy: 'ID DESC',
                    }

                }
            );

            threadneedle['mySOAPMethod']({})

            .done(
                function (val) {
                    console.log(val);
                    assert(val['GetEventsResult']['Success']);
                    done();
                },
                function (err) {
                    console.log(err);
                    assert.fail(err);
                }
            );

        });

    });



});
