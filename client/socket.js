var dgram   = require('dgram');
var Promise = require('bluebird');

var cfg     = require('../config');
var logger  = require('../logger');

var udp = {};

// Create UDP-socket
udp.socket = dgram.createSocket('udp4');

// Send UDP-packet
udp.sendPacket = function(buffer) {
    return new Promise(function(resolve,reject) {
        udp.socket.send(buffer, 0, buffer.length, cfg.udpPort, cfg.udpAddress, function(err, bytes) {
            if (err) {return reject(err)}
            logger.debug('UDP packet sent to ' + cfg.udpAddress +':'+ cfg.udpPort + ', bytes ' + bytes);
            resolve();
        });
    });
};

module.exports = udp;
