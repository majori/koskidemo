const fs        = require('fs');
const Promise   = require('bluebird');

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
cfg.buildPath = cfg.browserPath + '/build';

// Authorization config
var privateKey = process.env.KOSKIOTUS_PRIVATE_KEY_LOCATION;
var publicKey = process.env.KOSKIOTUS_PUBLIC_KEY_LOCATION;

if (privateKey) {
    readFile(privateKey)
    .then((key) => {
        cfg.private_key = key;
    })
    .catch((err) => {
        console.log('Can´t read private key!');
    })
}

if (publicKey) {
    readFile(publicKey)
    .then((key) => {
        cfg.public_key = key;
    })
    .catch((err) => {
        console.log('Can´t read public key!');
    })
}

function readFile(fileLocation) {
    return new Promise(function(resolve,reject) {
        fs.readFile(fileLocation, 'utf-8', function(err, data) {
            if (err) { return reject(err);}
            return resolve(data);
        });
    });
};

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
