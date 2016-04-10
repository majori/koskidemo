var winston = require('winston');
var path    = require('path');

var cfg = {};

// Node environment
cfg.env = process.env.NODE_ENV || 'development';

// UDP server config
cfg.udpAddress = process.env.KOSKIOTUS_UDP_SERVER_ADDRESS || '127.0.0.1';
cfg.udpPort = process.env.KOSKIOTUS_UDP_SERVER_PORT || 33333;

// HTTP server config
cfg.httpAddress = process.env.KOSKIOTUS_HTTP_SERVER_ADDRESS || '127.0.0.1';
cfg.httpPort = process.env.KOSKIOTUS_HTTP_SERVER_PORT || 3100;
cfg.ioPort = process.env.KOSKIOTUS_IO_SERVER_PORT || 3101;

cfg.publicPath = __dirname + '/server/public';

// Database config
cfg.dbLocation = (cfg.env != 'test') ? 'test/test_database.sqlite' : 'database.sqlite';

cfg.db = {
	client: 'sqlite3',
	connection: {
		filename: path.join(__dirname, cfg.dbLocation)
	},
    useNullAsDefault: true
};

//Logging config
var consoleLog = new (winston.transports.Console)({
    timestamp: _formatTimestamp(),
    level: 'debug',
    colorize: true
});

var fileLog = function(logLocation) {
    return new (winston.transports.File)({
        filename: __dirname + '/' + logLocation,
        level: 'info',
        timestamp: _formatTimestamp(),
        formatter: function(options) {
            return _formatTimestamp() +'--'+ options.level.toUpperCase() +'--'+ (undefined !== options.message ? options.message : '');
        },
        maxsize: 10000000,
        json: false
    });
}

var logOptions = {};
switch (cfg.env) {
    case 'development':
        logOptions.transports = [consoleLog]
    break;

    case 'production':
        logOptions.transports = [consoleLog, fileLog('output.log')];
    break;

    case 'test':
        logOptions.transports = [fileLog('test/test.log')];
    break;
}

cfg.logger = new (winston.Logger)(logOptions);

function _formatTimestamp() {
    var d = new Date();
    return d.getFullYear() + '-'
        + d.getMonth() + '-'
        + d.getDate() + 'T'
        + d.getHours() + ':'
        + d.getMinutes() + ':'
        + d.getSeconds();
}

module.exports = cfg;
