var _       = require('lodash');

var cfg     = require('../config');
var upd     = require('./udp');
var http    = require('./http');
var logger  = require('../logger');

// Store datapoints temporarily
var chartData = {
    measurement: [],
    guild: []
};

// UDP-package receieved
upd.on('message', function (data, remote) {

    // Parse binary buffer to text
    var BufferToText = data.toString();
    logger.debug('Packet from ' + remote.address + ':' + remote.port + ', buffer to string: ' + BufferToText);

    // Parse packet to object
    var parsedPacket = JSON.parse(BufferToText);

    // Check if parsed packet is valid
    if (!parsedPacket.command) {
        logger.error('UDP-packet didn´t have command field!');
    } else {

        switch(parsedPacket.command) {
            case 'reset-data':
                chartData.measurement = [];
                http.io.sockets.emit('reset-data');
            break;

            case 'reset-rank':
                chartData.guild = [];
                http.io.sockets.emit('reset-rank');
            break;

            case 'measurement':
                chartData['measurement'].push(parsedPacket.payload);
                http.io.sockets.emit('measurement', parsedPacket.payload);
            break;

            case 'guild':
                // TODO: Only update if there is already basket in data
                chartData['guild'].push(parsedPacket.payload);
                http.io.sockets.emit('guild', parsedPacket.payload);
            break;

            default:
                logger.error('Unknown command in UPD-packet!')
        }
    }
});

// New client connected to socket.io
http.io.on('connection', function (socket) {
    logger.info('Client connected, id: ' + socket.id);
    if (!_.isEmpty(chartData.measurement)) {
        socket.emit('initialize_measurements', chartData.measurement);
    }
    if (!_.isEmpty(chartData.guild)) {
        socket.emit('initialize_ranks', chartData.guild);
    }
});

