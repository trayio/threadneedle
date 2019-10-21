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

				// Add the global model headers and set security/authentication
				if (clientConfig.options) {

					if (clientConfig.options.headers) {
						_.forEach(clientConfig.options.headers, function (headerItem) {

							if (_.isString(headerItem)) {
								client.addSoapHeader(headerItem);
							} else {
								client.addSoapHeader(
									headerItem.value,
									headerItem.name,
									headerItem.namespace,
									headerItem.xmlns
								);
							}

						});
					}

					if (clientConfig.options.authentication) {
						client.setSecurity(clientConfig.options.authentication);
					}

				}

				client.on('request', (xml) => {
					console.log(xml);
				});

				return resolve(client);

			}
		);

	});
};
