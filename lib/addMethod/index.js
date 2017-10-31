
module.exports = function (soapFlag) {
    return (
        soapFlag ?
        require('./addMethodSOAP') :
        require('./addMethodREST')
    );
};
