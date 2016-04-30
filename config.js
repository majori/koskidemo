const fs        = require('fs');
const Promise   = require('bluebird');

var cfg = {};

// Node environment
cfg.env = process.env.NODE_ENV || 'development';

// Basket color
cfg.isRed = true;

// What temperature the basket is measuring
cfg.isWater = true;

// Addresses where client sends UDP
cfg.udpSendAddressess = ['127.0.0.1'];

// UDP server config
cfg.udpAddress = process.env.KOSKIOTUS_UDP_SERVER_ADDRESS || '127.0.0.1';
cfg.udpPort = process.env.KOSKIOTUS_UDP_SERVER_PORT || 33333;

// HTTP server config
cfg.httpAddress = process.env.KOSKIOTUS_HTTP_SERVER_ADDRESS || '127.0.0.1';
cfg.httpPort = process.env.KOSKIOTUS_HTTP_SERVER_PORT || 3100;
cfg.ioPort = process.env.KOSKIOTUS_IO_SERVER_PORT || 3101;

cfg.publicPath = __dirname + '/server/public';
cfg.browserPath = __dirname + '/server/browser';
cfg.buildPath = cfg.browserPath + '/build';

// Authorization config
cfg.privateKey = process.env.KOSKIOTUS_PRIVATE_KEY_LOCATION;
cfg.publicKey = process.env.KOSKIOTUS_PUBLIC_KEY_LOCATION;

// Database config

cfg.dbLocation = (cfg.env == 'test') ? 'test/test_database.sqlite' : 'database.sqlite';

cfg.db = {
	client: 'sqlite3',
	connection: {
		filename: __dirname + '/' + cfg.dbLocation
	},
    useNullAsDefault: true
};

// UDP Packet schema config

cfg.udpSchema = {
    signature: 's',
    packets: 'p',
    command: 'c',
    measurement: 'm',
    payload: 'pl',
    time: 't',
    depth: 'd',
    temperature: 'tm',
    waterTemperature: 'wt',
    airTemperature: 'at',
    guild: 'g',
    guildName: 'gn',
    basket: 'b',
    resetRed: 'rr',
    resetBlue: 'rb',
    resetRank: 'rR',
    isRed: 'r',
    true: 1,
    false: 0
}

module.exports = cfg;
