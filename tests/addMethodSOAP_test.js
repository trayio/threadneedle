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

    var regonline_token = require('./dummycredentials.json').regonline;

    function promiseFailFunc (done) {
        return function (err) {
            console.log(err);
            assert.fail(err);
            done();
        }
    }

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
                                APIToken: regonline_token
                            }
                        },
                        xmlns: 'http://www.regonline.com/api',
                    }]
                },

                data: {}


            });
        });

        it('should error if wsdl is not provided (or not a string)', function (done) {

            var privateThreadneedle = new ThreadNeedle(true);

            privateThreadneedle.global({

                soap: true,

                options: {
                    headers: [{
                        value: {
                            TokenHeader: {
                                APIToken: regonline_token
                            }
                        },
                        xmlns: 'http://www.regonline.com/api',
                    }]
                },

                data: {}


            });

            when(
                privateThreadneedle.addMethod(
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
                function () {

                    when(
                        privateThreadneedle['list_events']({})
                    )

                    .done(
                        promiseFailFunc(done),
                        function (err) {
                            assert.strictEqual(err, '`wsdl` field (string) must be provided to create a client instance.');
                            done();
                        }
                    );

                },
                promiseFailFunc(done)
            );

        });


        it('should be able to add a standard SOAP method', function (done) {

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
                function () {
                    assert(_.isFunction(threadneedle['list_events']));
                    done();
                },
                promiseFailFunc(done)
            );

        });

        it('should be able to execute a standard SOAP method', function (done) {
            this.timeout(20000);

            when(
                threadneedle['list_events']({})
            )

            .then(function (results) {
                assert(results['GetEventsResult']['Success']);
            })

            .done(done, promiseFailFunc(done));

        });


        it('should substitute to the url and data with a basic example', function (done) {
            this.timeout(10000);

            when(
                threadneedle.addMethod(
                    'list_events2',
                    {
                        method: 'Get{{event_type}}',

                        data: {
                            orderBy: '{{order_by}}',
                        }
                    }
                )
            )

            .done(
                function (result) {

                    when(
                        threadneedle['list_events2']({
                            event_type: 'Events',
                            order_by: 'ID DESC'
                        })
                    )

                    .then(function (results) {
                        assert(results['GetEventsResult']['Success']);
                    })

                    .done(done, promiseFailFunc(done));

                },
                promiseFailFunc(done)
            );

        });


        it('should substitute to the options with a basic example', function (done) {

            var privateThreadneedle = new ThreadNeedle(true);

            privateThreadneedle.global({

                soap: true,

                wsdl: 'https://www.regonline.com/api/default.asmx?WSDL',

                options: {
                    headers: [{
                        value: {
                            TokenHeader: {
                                APIToken: '{{access_token}}'
                            }
                        },
                        xmlns: 'http://www.regonline.com/api',
                    }]
                },

                data: {}


            });

            when(
                privateThreadneedle.addMethod(
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
                function () {

                    when(
                        privateThreadneedle['list_events']({
                            access_token: regonline_token
                        })
                    )

                    .then(function (results) {
                        assert(results['GetEventsResult']['Success']);
                    })

                    .done(done, promiseFailFunc(done));

                },
                promiseFailFunc(done)
            );

        });


        it('should reject if expects function returns error', function (done) {
            this.timeout(10000);

            when(
                threadneedle.addMethod(
                    'list_events3',
                    {
                        method: 'GetEvents',

                        data: {
                            orderBy: 'ID DESC',
                        },

                        expects: function (results) {
                            if (results.body['GetEventsResult']['Success'] === true) {
                                return 'Test Error';
                            }
                        }
                    }
                )
            )

            .done(
                function (result) {

                    when(
                        threadneedle['list_events3']({})
                    )

                    .done(
                        promiseFailFunc(done),
                        function (err) {
                            assert(err.message === 'Test Error');
                            done();
                        }
                    );

                },
                promiseFailFunc(done)
            );

        });

        it('should reject if notExpects function returns error', function (done) {
            this.timeout(10000);

            when(
                threadneedle.addMethod(
                    'list_events4',
                    {
                        method: 'GetEvents',

                        data: {
                            orderBy: 'ID DESC',
                        },

                        notExpects: function (results) {
                            if (results.body['GetEventsResult']['Success'] === true) {
                                return 'Test Error';
                            }
                        }
                    }
                )
            )

            .done(
                function (result) {

                    when(
                        threadneedle['list_events4']({})
                    )

                    .done(
                        promiseFailFunc(done),
                        function (err) {
                            assert(err.message === 'Test Error');
                            done();
                        }
                    );

                },
                promiseFailFunc(done)
            );

        });


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
                                    APIToken: regonline_token
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
                    assert(val['GetEventsResult']['Success']);
                    done();
                },
                function (err) {
                    assert.fail(err);
                }
            );

        });

    });

});
