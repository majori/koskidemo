var dgram  = require('dgram');
var Promise = require('bluebird');
var _       = require('lodash');

var cfg     = require('../config');
var logger  = cfg.logger;

var client = {};

client.socket = dgram.createSocket('udp4');

client.sendPacket = function(buffer) {
    return new Promise(function(resolve,reject) {
        client.socket.send(buffer, 0, buffer.length, cfg.udpPort, cfg.udpAddress, function(err, bytes) {
            if (err) {return reject(err)}
            logger.debug('UDP packet sent to ' + cfg.udpAddress +':'+ cfg.udpPort + ', bytes ' + bytes);
            resolve();
        });
    });
};

// Test packet sending
client.sendPacket(new Buffer(String(_.random(1,5, true))));

module.exports = client;
