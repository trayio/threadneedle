var _ = require('lodash');

module.exports = function (soapFlag) {

    var threadneedle = {

        // The key method
        addMethod: require('./addMethod')(soapFlag),

        // Global hook to set global options below
        global: require('./global')(soapFlag),

        // Default global settings (can be overridden)
        _globalOptions: {

            // TODO Good requests generall come back with a '2xx'
            // expects: {
            //   statusCode: 200
            // }

        }

    };


    return threadneedle;

};
