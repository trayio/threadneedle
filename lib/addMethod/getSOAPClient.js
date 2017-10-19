var _                  = require('lodash');
var when               = require('when');

var SOAP               = require('soap');


module.exports = function (clientConfig) {
	return when.promise(function (resolve, reject) {

		SOAP.createClient(
			clientConfig.wsdl,
			clientConfig.options || {},
			function(err, client) {

				if (err) {
					return reject(err);
				}

				// Add the global model headers
				if (clientConfig.options && clientConfig.options.headers) {
					_.forEach(clientConfig.options.headers, function (headerItem) {
						client.addSoapHeader(
							headerItem.value,
							headerItem.name,
							headerItem.namespace,
							headerItem.xmlns
						);
					});
				}

				return resolve(client);

			}
		);

	});
};
