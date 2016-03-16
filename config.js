var winston = require('winston');

var cfg = {};

// Node environment
cfg.env = process.env.NODE_ENV || 'development';

// UDP server config
cfg.udpAddress = process.env.DEMO_UDP_SERVER_ADDRESS || '127.0.0.1';
cfg.udpPort = process.env.DEMO_UDP_SERVER_PORT || 33333;

// HTTP server config
cfg.httpAddress = process.env.DEMO_HTTP_SERVER_ADDRESS || '127.0.0.1';
cfg.httpPort = process.env.DEMO_HTTP_SERVER_PORT || 3100;
cfg.ioPort = process.env.DEMO_IO_SERVER_PORT || 3101;

// Database config
cfg.db = {
	client: 'sqlite3',
	connection: {
		filename: './demo.sqlite'
	}
};

//Logging config
var consoleLog = new (winston.transports.Console)({
    timestamp: _formatTimestamp(),
    level: 'debug',
    colorize: true
});

var fileLog = function(logLocation) {
    return new (winston.transports.File)({
        filename: logLocation,
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
