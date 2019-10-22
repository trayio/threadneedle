const http = require('http');
const fs = require('fs');

const _ = require('lodash');
const needle = require('needle');
const SOAP = require('soap');

// SOAP.createClient(__dirname + '/regonline.wsdl', (err, client) => {
// 	console.log(__dirname);
// 	console.log(err);
// 	const clientDescription = client.describe();
// 	fs.writeFileSync(__dirname + '/describe.json', JSON.stringify(clientDescription, null, '\t'), 'utf8');
// });

const soapService = require('./soapService');

const wsdlXML = fs.readFileSync(__dirname + '/regonline.wsdl', 'utf8');

//TODO - not finished
//http server example
// const server = http.createServer(function (request, response) {
// 	response.end('404: Not Found: ' + request.url);
// });
//
// const soapServer = SOAP.listen(server, '/wsdl', soapService, wsdlXML);
//
// soapServer.on('request', (req, methodName) => {
// 	console.log('reqest', methodName);
// });
//
// soapServer.on('response', (resp, methodName) => {
// 	console.log('response', methodName);
// 	console.log(resp);
// });


const request = {
	headers: {
		'Content-Type': 'text/xml; charset=utf-8',
		SOAPAction: '"http://www.regonline.com/api/GetEvents"'
	},
	body: '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xmlns:tm="http://microsoft.com/wsdl/mime/textMatching/" xmlns:tns="http://www.regonline.com/api"><soap:Header><TokenHeader xmlns:undefined="http://www.regonline.com/api" xmlns="http://www.regonline.com/api"><APIToken>lO29j0in23WRCF9s3b6LvqARu1FCIhohPTVP4Pu1yom2y2h005KRAQ==</APIToken></TokenHeader></soap:Header><soap:Body><GetEvents xmlns="http://www.regonline.com/api"><orderBy>ID DESC</orderBy></GetEvents></soap:Body></soap:Envelope>'
};

// server.listen(8000, null, null, () => {
// 	console.log('server initialized');
// 	console.log(_.keys(soapServer));
// 	console.log(soapServer.path);
// 	console.log(soapServer.services);
//
// 	needle.post('localhost:8000/wsdl', request.body, { headers: request.headers }, (err, res, data) => {
// 		console.log('res');
// 		// console.log(res.statusCode);
// 		console.log(res.body);
// 		// console.log(data.toString());
// 	});
// });



class SOAPServer {

	constructor (port = 8000) {

		this.port = port;
		this.soapService = soapService;
		this.wsdlXML = wsdlXML;

		const server = this.server = http.createServer((request, response) => {
			// response.end('404: Not Found: ' + request.url);
			// if (request.url === '') {
			//
			// }
			console.log(request.url);
		});

		this.soapServer = SOAP.listen(server, '/default.asmx', this.soapService, this.wsdlXML);

		this.soapServer.on('request', (req, methodName) => {
			console.log('reqest', methodName);
		});
	}

	startServer (callback) {
		this.server.listen(this.port, null, null, (...listenArgs) => {
			//eslint-disable-next-line no-console
			console.log(`SOAP server at port ${this.port} initialized.`);
			callback(null);
		});
	}

	stopServer (callback) {
		this.server.close(() => {
			//eslint-disable-next-line no-console
			console.log(`SOAP server at port ${this.port} closed.`);
			callback(null);
		});
	}

}

const soapServer = new SOAPServer(8000);
soapServer.startServer(() => {

});

module.exports = SOAPServer;
