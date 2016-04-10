var socket  = require('dgram').createSocket('udp4');

var cfg     = require('../config');
var logger  = require('../logger');

// UDP-server started
socket.on('listening', function () {
    var address = socket.address();
    logger.info('Listening UDP on address ' + address.address + ":" + address.port);
});

// Bind UDP-server to a socket
socket.bind(cfg.udpPort, cfg.udpAddress);

module.exports = socket;
