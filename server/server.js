const _         = require('lodash');
const crypto    = require('crypto');

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

    var parsedUdpPacket = '';

    // Try to parse binary array to object
    try {
        // Parse binary buffer to text
        var BufferToText = data.toString();
        logger.debug('Packet from ' + remote.address + ':' + remote.port/* + ', buffer to string: ' + BufferToText*/);

        // Parse packet to object
        parsedUdpPacket = JSON.parse(BufferToText);
    }

    catch(err) {
        logger.debug('Error when parsing UDP-packet to JSON!', BufferToText);
        return;
    }

    // Verify packets if public key is defined
    if (cfg.public_key) {
        const verify = crypto.createVerify('RSA-SHA256');
        const signature = parsedUdpPacket.signature;

        //
        if (signature) {
            verify.update(JSON.stringify(parsedUdpPacket.packets));

            // Packet has verified
            if (verify.verify(cfg.public_key, parsedUdpPacket.signature, 'base64')) {
                processPackets(parsedUdpPacket.packets);

            // Verification failed
            } else {
                logger.debug('Verification failed');
            }

        // Packet doesn´t have signature field
        } else {
            logger.debug('Packet didn´t have "signature" field');
        }

    // Public key is undefined, don´t verify packets
    } else {
        processPackets(parsedUdpPacket.packets);
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

function processPackets(packets) {
    _.forEach(packets, (packet) => {
        switch(packet.command) {
        case 'reset-data':
            chartData.measurement = [];
            http.io.sockets.emit('reset-data');
        break;

        case 'reset-rank':
            chartData.guild = [];
            http.io.sockets.emit('reset-rank');
        break;

        case 'measurement':
            chartData['measurement'].push(packet.payload);
            http.io.sockets.emit('measurement', packet.payload);
        break;

        case 'guild':
            // TODO: Update chartData, don't always append into it
            chartData['guild'].push(packet.payload);

            http.io.sockets.emit('guild', packet.payload);
        break;

        default:
            logger.error('Unknown command in UPD-packet!', packet);
        }
    })
};
