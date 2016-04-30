const _         = require('lodash');
const crypto    = require('crypto');
const fs        = require('fs');

var cfg     = require('../config');
var upd     = require('./udp');
var http    = require('./http');
var logger  = require('../logger');

const s = cfg.udpSchema;

var publicKey = '';

// Store datapoints temporarily
var chartData = {
    depth: {
        red: [],
        blue: []
    },
    guild: []
};

// UDP-package receieved
upd.on('message', function (data, remote) {

    var parsedUdpPacket = '';

    // Try to parse binary array to object
    try {
        // Parse binary buffer to text
        var BufferToText = data.toString();
        logger.debug('Packet from ' + remote.address + ':' + remote.port)
        logger.debug('Buffer to string: ' + BufferToText);

        // Parse packet to object
        parsedUdpPacket = JSON.parse(BufferToText);
    }

    catch(err) {
        logger.debug('Error when parsing UDP-packet to JSON!', BufferToText);
        return;
    }

    // Verify packets if public key is defined
    if (publicKey) {
        const verify = crypto.createVerify('RSA-SHA256');
        const signature = parsedUdpPacket[s.signature];

        // Signature exists
        if (signature) {
            verify.update(JSON.stringify(parsedUdpPacket[s.packets]));

            // Packet has verified
            if (verify.verify(publicKey, parsedUdpPacket[s.signature], 'base64')) {
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
    if (!_.isEmpty(chartData.depth)) {
        socket.emit('initialize_depths', chartData.depth);
    }
    if (!_.isEmpty(chartData.guild)) {
        socket.emit('initialize_ranks', chartData.guild);
    }
});

function processPackets(packets) {
    _.forEach(packets, (packet) => {

        switch(packet[s.command]) {

        case s.resetRed:
            chartData.depth.red = [];
            http.io.sockets.emit('reset-red');
        break;

        case s.resetBlue:
            chartData.depth.blue = [];
            http.io.sockets.emit('reset-blue');
        break;

        case s.resetRank:
            chartData.guild = [];
            http.io.sockets.emit('reset-rank');
        break;

        case s.depth:
            var payload = renameDepthPacket(packet[s.payload]);
            var color = (payload.isRed) ? 'red' : 'blue';
            chartData['depth'][color].push(payload);
            http.io.sockets.emit('depth', payload);
        break;

        case s.temperature:
            var payload = renameTemperaturePacket(packet[s.payload]);
            http.io.sockets.emit('temperature', payload);

        break;

        case s.guild:
            var payload = renameGuildPacket(packet[s.payload]);

            if (payload.guildName && payload.basket) {
                updateRankData(payload);

                http.io.sockets.emit('guild', payload);
            }

        break;

        default:
            logger.error('Unknown command in UPD-packet!', packet);
        }
    })
};

function renameDepthPacket(payload) {

    return {
        isRed: (payload[s.isRed] === s.true) ? true : false,
        time: payload[s.time],
        depth: payload[s.depth],
        waterTemperature: payload[s.waterTemperature],
        airTemperature: payload[s.airTemperature]
    };
};

function renameGuildPacket(payload) {
    return {
        guildName: payload[s.guildName],
        basket: payload[s.basket],
        time: payload[s.time],
        isRed: (payload[s.isRed] === s.true) ? true : false
    };

};

function renameTemperaturePacket(payload) {
    return {
        airTemperature: payload[s.airTemperature],
        waterTemperature: payload[s.waterTemperature]
    }
};

function updateRankData(payload) {
    var entry = _.find(chartData.guild, {guildName: payload.guildName, basket: payload.basket});
    if (entry) {
        entry.time = payload.time;
    } else {
        chartData.guild.push(payload);
    }
}

if (cfg.publicKey) {
    fs.readFile(cfg.publicKey, 'utf-8', function(err, data) {
        if (err) { logger.error('Can´t read public key!');}
        else {publicKey = data}
    });
}
