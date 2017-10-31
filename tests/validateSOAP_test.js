var assert       = require('assert');
var _            = require('lodash');
var validateInput    = require('../lib/addMethod/validateSOAPInput');


describe('validateSOAPInput', function () {

    function throwTest (methodName, config, errMsg) {
        assert.throws(
            function () {
                validateInput(methodName, config)
            },
            function (err) {
                return err.message === errMsg;
            }
        );
    }

    it('should err if methodName is not provided or a string', function () {
        throwTest(undefined, undefined, 'The first parameter passed to `addMethod` should be a string.');
        throwTest(123, undefined, 'The first parameter passed to `addMethod` should be a string.');
    });

    it('should return if config is a function', function () {
        assert(
            _.isUndefined(
                validateInput('test', function () {})
            )
        );
    });

    it('should err if config is not provided or an object', function () {
        throwTest('test', undefined, 'The `config` object should be an object.');
        throwTest('test', 123, 'The `config` object should be an object.');
    });

    it('should err if methodName already exists', function () {
        var methodName = 'test';
        assert.throws(
            function () {
                validateInput.call(
                    {
                        'test': function () {}
                    },
                    methodName,
                    {}
                );
            },
            function (err) {
                return err.message === 'Method `' + methodName + '` has already been declared.';
            }
        );
    });

    it('should err if config.method is not provided', function () {
        throwTest('test', {}, 'The `method` config parameter should be declared.');
    });

    it('should err if config.expects and/or config.notExpects is provided but is not a function', function () {
        throwTest('test', { method: 'testOp', expects: 200 }, 'The `expects` config parameter must be a function if provided.');
        throwTest('test', { method: 'testOp', notExpects: 200 }, 'The `notExpects` config parameter must be a function if provided.');
    });



});
