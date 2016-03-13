var app     = require('express')();
var server  = require('http').Server(app);
var io      = require('socket.io')(server);
var socket  = require('dgram').createSocket('udp4');

var cfg     = require('../config');
var logger  = cfg.logger;

app.get('/', function(req, res) {
    res.send('Hello world!');
});

app.listen(cfg.httpPort, function() {
    logger.info('Listening HTTP on port ' + cfg.httpPort);
});

socket.on('listening', function () {
    var address = socket.address();
    logger.info('Listening UDP on address ' + address.address + ":" + address.port);
});

socket.on('message', function (data, remote) {
    logger.debug('Packet from ' + remote.address + ':' + remote.port + ', buffer to string: ' + data.toString());
});

socket.bind(cfg.udpPort, cfg.udpAddress);
