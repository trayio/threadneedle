
module.exports = function (soapFlag) {
    return (
        soapFlag ?
        function (options) {

            this._globalOptions = options;
            this._globalClient = null;

            this._setClient = function (client) {
                this._globalClient = client;
            };

            this._getClient = function (client) {
                return this._globalClient || null;
            };

        }:
        function (options) {
          this._globalOptions = options;
        }
    );
};
