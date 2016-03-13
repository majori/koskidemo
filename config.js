var winston = require('winston');

var cfg = {};

// UDP server config
cfg.udpAddress = process.env.DEMO_UDP_SERVER_ADDRESS || '127.0.0.1';
cfg.udpPort = process.env.DEMO_UDP_SERVER_PORT || 33333;

// HTTP server config
cfg.httpAdress = process.env.DEMO_HTTP_SERVER_ADDRESS || '127.0.0.1';
cfg.httpPort = process.env.DEMO_HTTP_SERVER_PORT || 3100;

// Database config
cfg.db = {
	client: 'sqlite3',
	connection: {
		filename: './demo.sqlite'
	}
};

//Logging config
cfg.logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: function() {
                var d = new Date();
                var ts = d.getFullYear() + '-';
                ts += d.getMonth() + '-';
                ts += d.getDate() + 'T';
                ts += d.getHours() + ':';
                ts += d.getMinutes() + ':';
                ts += d.getSeconds();
                return ts;
            },
            level: 'debug',
            colorize: true
        })
    ]
})

module.exports = cfg;
