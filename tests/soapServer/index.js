const http = require('http');
const fs = require('fs');

const SOAP = require('soap');

// SOAP.createClient(__dirname + '/regonline.wsdl', (err, client) => {
// 	console.log(__dirname);
// 	console.log(err);
// 	console.log(require('util').inspect(client.describe(), { depth: null }));
// });

const soapService = require('./soapService');

const wsdlXML = fs.readFileSync(__dirname + '/regonline.wsdl', 'utf8');

//TODO - not finished
//http server example
const server = http.createServer(function (request, response) {
	response.end('404: Not Found: ' + request.url);
});

server.listen(8000);
SOAP.listen(server, '/wsdl', soapService, wsdlXML, function () {
	console.log('server initialized');
});

const needle = require('needle');

needle.get('localhost:8000/wsdl', (err, res, data) => {
	console.log(data.toString());
});
