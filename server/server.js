const _         = require('lodash');
const crypto    = require('crypto');

var cfg     = require('../config');
var upd     = require('./udp');
var http    = require('./http');
var logger  = require('../logger');

const s = cfg.udpSchema;

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
        const signature = parsedUdpPacket[s.signature];

        //
        if (signature) {
            verify.update(JSON.stringify(parsedUdpPacket[s.packets]));

            // Packet has verified
            if (verify.verify(cfg.public_key, parsedUdpPacket[s.signature], 'base64')) {
                processPackets(parsedUdpPacket[s.packets]);

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
        processPackets(parsedUdpPacket[s.packets]);
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
        switch(packet[s.command]) {
        case s.resetData:
            chartData.measurement = [];
            http.io.sockets.emit('reset-data');
        break;

        case s.resetRank:
            chartData.guild = [];
            http.io.sockets.emit('reset-rank');
        break;

        case s.measurement:
            var payload = packet[s.payload];
            chartData['measurement'].push(payload);
            http.io.sockets.emit('measurement', {
                time: payload[s.time],
                depth: payload[s.depth],
                waterTemperature: payload[s.waterTemperature],
                airTemperature: payload[s.airTemperature]
            });
        break;

        case s.guild:
            // TODO: Update chartData, don't always append into it
            var payload = packet[s.payload];
            chartData['guild'].push(payload);

            http.io.sockets.emit('guild', {
                guildName: payload[s.guildName],
                basket: payload[s.basket],
                time: payload[s.time]
            });
        break;

        default:
            logger.error('Unknown command in UPD-packet!', packet);
        }
    })
};
