var dgram = require('dgram');

var cfg = require('../config');

var server = dgram.createSocket('udp4');
server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port);
    console.log(JSON.parse(message));
});

server.bind(cfg.serverPort, cfg.serverAddress);
