var dgram = require('dgram');

var cfg = require('../config');

var client = dgram.createSocket('udp4');
var obj = {
    "test" : {
        "project": "IoT",
        "size": 32
    }
};

var message = new Buffer(JSON.stringify(obj));

client.send(message, cfg.serverPort, cfg.serverAddress, function(err, bytes) {
    console.log('UDP message sent to ' + cfg.serverAddress +':'+ cfg.serverPort + ', bytes ' + bytes);
    client.close();
});
