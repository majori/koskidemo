// DB kysely kilta ja kori, lisaa temp+depth
// promptista paketin muoto

var _       = require('lodash');
var depths  = require('./sensors/depth.js')

var prompt  = require('./prompt');
var db      = require('./database');
var client  = require('./socket');


var startTimestamp = Date.now();
var shiftTimestamp = 0;
var massivepacket = {};
var depthsensor = new depths();
var depthMean = 0;
var latestTime = 0;

setInterval(function(){

	depthMean = depthsensor.getDepthMean();
	db.addDepth(depthMean);
	// Basket has risen from the rapid
	if (depthMean > 150 && shiftTimestamp == 0){
		console.log("rising from the abyss");
		shiftTimestamp = Date.now();
		latestTime = Date.now() - startTimestamp;

	}
	// Basket has been sunken in the rapid
	else if(depthMean < 150 && shiftTimestamp != 0){
		console.log("sinking into the abyss");
		startTimestamp = startTimestamp + Date.now() - shiftTimestamp;
		shiftTimestamp = 0;
		latestTime = Date.now() - startTimestamp;
	}
	// Basket is in the air
	else if(depthMean > 150 && shiftTimestamp != 0){}
	// Basket is in the rapid
	else{
		latestTime = Date.now() - startTimestamp;
	}


}, 500);




setInterval(function() {
	massivepacket = {
		packets: [
		{
			command: 'measurement',
			payload:  {
				time: latestTime / 1000,
				depth: depthMean,
				waterTemperature: 4.4,
				airTemperature: 13.3
			}
		},
		{
			command: 'guild',
			payload: {
				guildName: db.getLatestGuild().name,
				basket: db.getLatestGuild().basket,
				time: latestTime
			}
		}
		]
	};
	console.log ("guildname" + db.getLatestGuild().name);
	console.log ("depth : " + depthsensor.getDepth());
	console.log ("Time : " + latestTime / 1000);
	client.sendPacket(new Buffer(JSON.stringify(massivepacket)));
}, 1000);

prompt.commandLine();
