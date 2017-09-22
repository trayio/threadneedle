var when           = require('when');

var setupMethod    = require('./setupMethod');


var client;


module.exports = function (methodName, config) {

    var threadneedle = this;

    return when.promise(function (resolveFinal, reject) {

        function resolve () {
            resolveFinal(
                setupMethod(
                    threadneedle,
                    client,
                    methodName,
                    config
                )
            );
        }

        if (!client) {
            when(require('./getClient')(threadneedle._globalOptions))

            .done(
                function (clientRef) {
                    client = clientRef;
                    resolve();
                },
                function (err) {
                    throw new Error(err);
                }
            );
        } else {
            resolve();
        }

    });

};
