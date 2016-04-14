const dgram     = require('dgram');
const Promise   = require('bluebird');
var crypto      = require('crypto')

var cfg     = require('../config');
var logger  = require('../logger');

var udp = {};

// Create UDP-socket
udp.socket = dgram.createSocket('udp4');

// Send UDP-packet
udp.sendPacket = function(object) {
    return new Promise(function(resolve,reject) {
        var packetsToStr = JSON.stringify(object[cfg.udpSchema.packets]);

        // If private key is defined, sign message
        if (cfg.private_key) {
            var sign = crypto.createSign('RSA-SHA256');
            sign.update(packetsToStr);

            object[cfg.udpSchema.signature] = sign.sign(cfg.private_key, 'base64');
        }

        var buffer = new Buffer(JSON.stringify(object))
        udp.socket.send(buffer, 0, buffer.length, cfg.udpPort, cfg.udpAddress, function(err, bytes) {
            if (err) {return reject(err)}
            logger.debug('UDP packet sent to ' + cfg.udpAddress +':'+ cfg.udpPort + ', bytes ' + bytes);
            logger.debug(object);
            resolve();
        });
    });
};

module.exports = udp;
