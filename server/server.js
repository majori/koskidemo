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

// Store datapoints temporarily
var chartData = {
    measurement: [],
    guild: []
};

// Configure static paths to www content
app.use(express.static(cfg.publicPath + '/views'));
app.use('/assets', express.static(cfg.publicPath + '/assets'));
app.use('/styles', express.static(cfg.publicPath + '/styles'));
app.use(favicon(cfg.publicPath + '/assets/img/favicon.ico'));

// Configure available routes in routes.js
routes(app);

// Set up Socket.IO
server.listen(3101, cfg.httpAddress, function() {
    logger.info('Socket.IO listening on port ' + cfg.httpAddress + ':' + cfg.ioPort);
});

// Set up express server
app.listen(cfg.httpPort, cfg.httpAddress, function() {
    logger.info('Listening HTTP on address ' + cfg.httpAddress + ':' + cfg.httpPort);
});

// New client connected to socket.io
io.on('connection', function (socket) {
    logger.info('Client connected, id: ' + socket.id);
    if (!_.isEmpty(chartData.measurement)) {
        socket.emit('initialize_measurements', chartData.measurement);
    }
    if (!_.isEmpty(chartData.guild)) {
        socket.emit('initialize_ranks', chartData.guild);
    }

});

// ## UDP-server
//

// UDP-server started
socket.on('listening', function () {
    var address = socket.address();
    logger.info('Listening UDP on address ' + address.address + ":" + address.port);
});

// UDP-package receieved
socket.on('message', function (data, remote) {

    // Parse binary buffer to text
    var dataToText = data.toString();
    logger.debug('Packet from ' + remote.address + ':' + remote.port + ', buffer to string: ' + dataToText);

    // Parse packet to object
    var parsedPacket = JSON.parse(dataToText);

    if (!parsedPacket.command) {
        logger.error('UDP-packet didn´t have command field!');
    } else {

        switch(parsedPacket.command) {
            case 'reset-data':
                chartData.measurement = [];
                io.sockets.emit('reset-data');
            break;

            case 'reset-rank':
                chartData.guild = [];
                io.sockets.emit('reset-rank');
            break;

            // Catch packets which go to browser
            default:
                chartData[parsedPacket.command].push(parsedPacket.payload);
                io.sockets.emit(parsedPacket.command, parsedPacket.payload);
        }
    }
});

// Bind UDP-server to a socket
socket.bind(cfg.udpPort, cfg.udpAddress);

