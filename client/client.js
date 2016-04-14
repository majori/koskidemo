var _       = require('lodash');
var depths  = require('./sensors/depth.js')

var prompt  = require('./prompt');
var db      = require('./database');
var client  = require('./socket');
var logger  = require('../logger');
var cfg     = require('../config');

prompt.commandLine();

const s = cfg.udpSchema;

// UPD-packet sending interval (ms)
const UDP_SEND_INTERVAL = 1000;

// Depth library polling interval (ms)
const DEPTH_POLLING_INTERVAL = 500;

var startTimestamp = Date.now();
var shiftTimestamp = 0;

// How long basket has been in the water
var latestTime = 0;

// Depth related variables
var depthSensor = new depths();
const DEPTH_VALUE_RANGE = 150;
var depthMean = 0;

setInterval(function(){

	depthMean = depthSensor.getDepthMean();
	db.addDepth(depthMean);

	// Basket has risen from the rapid
	if (depthMean > DEPTH_VALUE_RANGE && shiftTimestamp == 0) {
		logger.debug('Rising from the abyss');
		shiftTimestamp = Date.now();
		latestTime = Date.now() - startTimestamp;
	}

	// Basket has been sunken in the rapid
	else if (depthMean < DEPTH_VALUE_RANGE && shiftTimestamp != 0) {
		logger.debug('Sinking into the abyss');
		startTimestamp = startTimestamp + Date.now() - shiftTimestamp;
		shiftTimestamp = 0;
		latestTime = Date.now() - startTimestamp;
	}

	// Basket is in the air
	else if (depthMean > DEPTH_VALUE_RANGE && shiftTimestamp != 0){

    }

    // Basket is in the rapid
	else {
		latestTime = Date.now() - startTimestamp;
	}

}, DEPTH_POLLING_INTERVAL);

// Generate packets every second
setInterval(function() {
    var latestGuild = db.getLatestGuild();
	var UDPpacket = {
		[s.packets]: [
		{
			[s.command]: s.measurement,
			[s.payload]:  {
				[s.time]: latestTime / 1000,
				[s.depth]: depthMean,
				[s.waterTemperature]: 4.4,
				[s.airTemperature]: 13.3
			}
		},
		{
			[s.command]: s.guild,
			[s.payload]: {
				[s.guildName]: latestGuild.name,
				[s.basket]: latestGuild.basket,
				[s.time]: latestTime
			}
		}]
	};

	client.sendPacket(UDPpacket)
    .then(() => { logger.debug('UDP-packet sent', UDPpacket); });

}, UDP_SEND_INTERVAL);

prompt.commandLine();
