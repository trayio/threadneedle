var _                  = require('lodash');
var when               = require('when');

var SOAP               = require('soap');


module.exports = function (clientOptions) {
	return when.promise(function (resolve, reject) {

		SOAP.createClient(clientOptions.wsdl, function(err, client) {

			if (err) {
				return reject(err);
			}

			// Add the global model headers
			if (clientOptions.options && clientOptions.options.headers) {
				_.forEach(clientOptions.options.headers, function (headerItem) {
					client.addSoapHeader(
						headerItem.value,
						headerItem.name,
						headerItem.namespace,
						headerItem.xmlns
					);
				});
			}

			return resolve(client);

		});

	});
};
