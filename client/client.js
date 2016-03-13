var socket  = require('dgram').createSocket('udp4');

var cfg     = require('../config');
var logger  = cfg.logger;

var obj = {
    test : {
        project: "IoT",
        size: 32
    }
};

var message = new Buffer(JSON.stringify(obj));

socket.send(message, 0, message.length, cfg.udpPort, cfg.udpAddress, function(err, bytes) {
    logger.debug('UDP message sent to ' + cfg.udpAddress +':'+ cfg.udpPort + ', bytes ' + bytes);
    socket.close();
});
