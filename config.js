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
cfg.browserPath = __dirname + '/server/browser';

// Database config
cfg.dbLocation = (cfg.env == 'test') ? 'test/test_database.sqlite' : 'database.sqlite';

cfg.db = {
	client: 'sqlite3',
	connection: {
		filename: __dirname + '/' + cfg.dbLocation
	},
    useNullAsDefault: true
};

module.exports = cfg;
