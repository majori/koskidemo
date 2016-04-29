const dgram     = require('dgram');
const Promise   = require('bluebird');
const crypto    = require('crypto');
const _         = require('lodash');
const fs        = require('fs');

var cfg     = require('../config');
var logger  = require('../logger');

const s = cfg.udpSchema;

var udp = {};

const ALLOWED_BUFFER_SIZE = (cfg.privateKey) ? 340 : 512;

// Create UDP-socket
udp.socket = dgram.createSocket('udp4');

// Send UDP-packet
udp.sendPacket = function(object) {

    return new Promise(function(resolve,reject) {
        var packets = object[s.packets];

        // Check if packet is too big and needs to be splitted
        if (Buffer.byteLength(JSON.stringify(object)) > ALLOWED_BUFFER_SIZE && packets.length > 1) {

            logger.debug('Too big UDP-packet, slicing it to half. Number of packets: ' + packets.length + ', bytes: ' + Buffer.byteLength(JSON.stringify(object)));

            var midIndex = Math.floor(packets.length / 2);
            return Promise.join([
                udp.sendPacket({ [s.packets]: _.slice(packets, 0, midIndex) }),
                udp.sendPacket({ [s.packets]: _.slice(packets, midIndex) })
            ])
            .then(() => {return resolve()});

        // The UDP object have no packets to send
        } else if (packets.length === 0) {
            logger.debug('No packets in UDP object');
            return resolve();

        // Send package
        } else {
            var packetsToStr = JSON.stringify(object[s.packets]);

            // If private key is defined, sign message
            if (udp.privateKey) {
                var sign = crypto.createSign('RSA-SHA256');
                sign.update(packetsToStr);

                object[s.signature] = sign.sign(udp.privateKey, 'base64');
            }

            var buffer = new Buffer(JSON.stringify(object));

            udp.socket.send(buffer, 0, buffer.length, cfg.udpPort, cfg.udpAddress, function(err, bytes) {
                if (err) {return reject(err)}
                logger.debug('UDP packet sent to ' + cfg.udpAddress +':'+ cfg.udpPort + ', bytes ' + bytes);
                return resolve();
            });
        }
    });
};

if (cfg.privateKey) {
    fs.readFile(cfg.privateKey, 'utf-8', function(err, data) {
        if (err) { logger.error('Can´t read private key!');}
        else {udp.privateKey = data}
    });
}

module.exports = udp;
