var express = require('express')
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);
var socket  = require('dgram').createSocket('udp4');
var favicon = require('serve-favicon');
var _       = require('lodash');

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

server.listen(3101, cfg.httpAddress, function() {
    logger.info('Socket.IO listening on port ' + cfg.httpAddress + ':' + cfg.ioPort);
});

app.listen(cfg.httpPort, cfg.httpAddress, function() {
    logger.info('Listening HTTP on address ' + cfg.httpAddress + ':' + cfg.httpPort);
});

io.on('listening', function() {
    logger.debug('IO listening')
})

io.on('connection', function (socket) {
    logger.info('Client connected');
});

// ## UDP-server
//

socket.on('listening', function () {
    var address = socket.address();
    logger.info('Listening UDP on address ' + address.address + ":" + address.port);
});

socket.on('message', function (data, remote) {
    logger.debug('Packet from ' + remote.address + ':' + remote.port + ', buffer to string: ' + data.toString());
    io.sockets.emit('depth', {value: data.toString()});
});

socket.bind(cfg.udpPort, cfg.udpAddress);

