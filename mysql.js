var mysql = require('mysql')

var connection = (function () {
    var instance;
 
    function createInstance() {
        var connectionObj = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'clearglass_customer'
        }) 
        connectionObj.connect()
        return connectionObj;
    }
 
    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

module.exports.connection = connection;