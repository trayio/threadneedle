const http = require('http');
const fs = require('fs');

const _ = require('lodash');
const SOAP = require('soap');

const soapService = require('./soapService');

const wsdlXML = fs.readFileSync(__dirname + '/regonline.wsdl', 'utf8');

class SOAPServer {

	constructor (port = 8000) {

		this.port = port;
		this.soapService = soapService;
		this.wsdlXML = wsdlXML;

		const server = this.server = http.createServer((request, response) => {
			response.end('404: Not Found: ' + request.url);
		});

		this.soapServer = SOAP.listen(server, '/default.asmx', this.soapService, this.wsdlXML);

		//Use this for debugging if needed
		// this.soapServer.on('request', (req, methodName) => {
		// 	console.log('reqest', methodName);
		// });
	}

	startServer (callback) {
		this.server.listen(this.port, null, null, () => {
			//eslint-disable-next-line no-console
			console.log(`SOAP server at port ${this.port} initialized.`);
			if (_.isFunction(callback)) { callback(null); }
		});
	}

	stopServer (callback) {
		this.server.close(() => {
			//eslint-disable-next-line no-console
			console.log(`SOAP server at port ${this.port} closed.`);
			if (_.isFunction(callback)) { callback(null); }
		});
	}

}

//Start/stop server if this file is directly invoked, i,e, `node index.js`
if (require.main === module) {
	const soapServer = new SOAPServer(8000);
	soapServer.startServer();
	process.on('SIGINT', () => {
		soapServer.stopServer(() => {
			process.exit(2);
		});
	});
}



module.exports = SOAPServer;
