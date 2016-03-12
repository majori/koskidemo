var cfg = {};

cfg.serverAdress = process.env.DEMO_SERVER_ADDRESS || '127.0.0.1';
cfg.serverPort = process.env.DEMO_SERVER_PORT || 33333;

cfg.db = {
	client: 'sqlite3',
	connection: {
		filename: './demo.sqlite'
	}
};

module.exports = cfg;
