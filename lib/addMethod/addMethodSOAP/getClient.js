var _                  = require('lodash');
var when               = require('when');

var SOAP               = require('soap');


module.exports = function (threadneedle) {
	return when.promise(function (resolve, reject) {

		var globalModel = threadneedle._globalOptions;

		SOAP.createClient(globalModel.wsdl, function(err, client) {

			if (err) {
				return reject(err);
			}

			// Add the global model headers
			if (globalModel.options && globalModel.options.headers) {
				_.forEach(globalModel.options.headers, function (headerItem) {
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
