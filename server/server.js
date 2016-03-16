var express = require('express')
var app     = express();
var server  = require('http').Server(app);
var io      = require('socket.io')(server);
var socket  = require('dgram').createSocket('udp4');
var favicon = require('serve-favicon');

var cfg     = require('../config');
var routes  = require('./routes');
var logger  = cfg.logger;

// ## HTTP-server
//

app.use(express.static(__dirname + '/public/views'));
app.use('/assets', express.static(__dirname + '/public/assets'));
app.use('/styles', express.static(__dirname + '/public/styles'));
app.use(favicon(__dirname + '/public/assets/img/favicon.ico'));

// HTML views
routes(app);

app.listen(cfg.httpPort, cfg.httpAddress, function() {
    logger.info('Listening HTTP on address ' + cfg.httpAddress + ':' + cfg.httpPort);
});

// ## UDP-server
//

socket.on('listening', function () {
    var address = socket.address();
    logger.info('Listening UDP on address ' + address.address + ":" + address.port);
});

socket.on('message', function (data, remote) {
    logger.debug('Packet from ' + remote.address + ':' + remote.port + ', buffer to string: ' + data.toString());
});

socket.bind(cfg.udpPort, cfg.udpAddress);
