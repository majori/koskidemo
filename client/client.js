var _       = require('lodash');
var depths  = require('./sensors/depth.js')
var temps	= require('./sensors/build/Release/temperature')

var prompt  = require('./prompt');
var db      = require('./database');
var client  = require('./socket');
var logger  = require('../logger');
var cfg     = require('../config');

const s = cfg.udpSchema;

// UPD-packet sending interval (ms)
const UDP_SEND_INTERVAL = 1000;

// Depth library polling interval (ms)
const DEPTH_POLLING_INTERVAL = 500;

// Water temperature polling interval (ms)
const WATER_TEMP_INTERVAL = 10000;

var startTimestamp = Date.now();
var shiftTimestamp = 0;

// How long basket has been in the water
var latestTime = 0;

var latestSendTime = 0;

// Depth related variables
var depthSensor = new depths();
const DEPTH_VALUE_RANGE = 150;
var depthMean = 0;

var temperature = 0;

// Guild and basket related variables
var latestGuild;
var newGuild;

setInterval(function(){

	var temp = temps.read();
	// Error handling, if sensor read error occured, value is -100 (float)

	setTimeout(function(){

		if (temp > -99 && temp < 100){
			temperature = Math.round(temp * 10) / 10;
			var tempPacket(
				[s.packets]: [
				{
					[s.command]: s.temperature,
					[s.payload]:  {
						[s.waterTemperature]: (cfg.isWater) ? temperature : null,
						[s.airTemperature]: (!cfg.isWater) ? temperature : null
					}
				}]
			);
			client.sendPacket(tempPacket);
		}	
		else{
			logger.debug('Water temperature read error');
		}
	}, 1100);


}, WATER_TEMP_INTERVAL);

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

    newGuild = db.getLatestGuild();
    
    if (newGuild != latestGuild){
    	latestTime = 0;
    	startTimestamp = Date.now();
    	shiftTimestamp = 0;
    	latestGuild = newGuild;
    	var GuildPacket = {
    		[s.packets]: [
    		{
				[s.command]: s.guild,
				[s.payload]: {
					[s.guildName]: latestGuild.name,
					[s.basket]: latestGuild.basket,
					[s.time]: Math.floor(latestTime / 1000),
                	[s.isRed]: cfg.isRed ? s.true : s.false
				}
			}]
    	};
    	client.sendPacket(GuildPacket);
    }
	

    if (latestSendTime != latestTime) {
    	var UDPpacket = {
			[s.packets]: [
			{
				[s.command]: s.depth,
				[s.payload]:  {
					[s.time]: Math.floor(latestTime / 1000),
					[s.depth]: (DEPTH_VALUE_RANGE - depthMean).toFixed(1),
	                [s.isRed]: cfg.isRed ? s.true : s.false
				}
			},
			
			{
				[s.command]: s.guild,
				[s.payload]: {
					[s.guildName]: latestGuild.name,
					[s.basket]: latestGuild.basket,
					[s.time]: Math.floor(latestTime / 1000),
	                [s.isRed]: cfg.isRed ? s.true : s.false
				}
			}]
		};
        client.sendPacket(UDPpacket);
        latestSendTime = latestTime;
    }


}, UDP_SEND_INTERVAL);

prompt.commandLine();

