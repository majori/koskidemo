var cluster = require('cluster');

if (cluster.isMaster) {
    cluster.fork();

    // Restart app if there is an uncaught error
    cluster.on('exit', function(worker, code, signal) {
        cluster.fork();
    });
}

if (cluster.isWorker) {
    // The app

    var fs      = require('fs');

    var depths  = require('./sensors/depth.js');
    var temps   = require('./sensors/build/Release/temperature');
    var logger  = require('../logger');
    var cfg     = require('../config');
    var prompt  = require('./prompt');
    var db      = require('./database');
    var udp     = require('./udp');

    const s = cfg.udpSchema;

    // UPD-packet sending interval (ms)
    const UDP_SEND_INTERVAL = 1000;

    // Depth library polling interval (ms)
    const DEPTH_POLLING_INTERVAL = 500;

    // Temperature polling interval (ms)
    const TEMP_INTERVAL = 10000;

    var startTimestamp;
    var shiftTimestamp;

    // How long basket has been in the water
    var latestTime = 0;
    var latestSendTime = 0;

    // Depth related variables
    var zeroDepthSent = 0;
    var depthSensor = new depths();
    const DEPTH_VALUE_RANGE = 146;
    var depthMean = 0;
    var depth;

    var temperature = 0;
    var temp = undefined

    // Guild and basket related variables
    var latestGuild = undefined;
    var newGuild = undefined;

    // If a backup exists, read it
    fs.access('latesttime.txt', fs.R_OK | fs.W_OK, (err) => {
        if (err) {
            logger.info('No backup found');
            startTimestamp = Date.now();

        } else {
            db.updateLatestGuild();
            logger.info('Backup found');
            var backup = String(fs.readFileSync('latesttime.txt'));
            var backup = backup.split(';');
            latestTime = backup[0].replace('"', '');
            startTimestamp = backup[1].replace('"','');
            shiftTimestamp = backup[2].replace('"', '');

            logger.debug('LT: ' + latestTime);
            logger.debug('STS: ' + (Date.now() - startTimestamp));
            logger.debug('Shift: ' + shiftTimestamp);
        }

    });

    setInterval(function() {

        temps.read(function(results) {
            temp = results.result;
        });

        setTimeout(function() {
            if (temp == undefined) {
                logger.info('Temperature sensor timed out!');
            }

            // If the measured temperature is within the sensors range
            else if (temp > -99 && temp < 100) {
                temperature = temp.toFixed(1);
                var tempPacket = {
                    [s.packets]: [
                    {
                        [s.command]: s.temperature,
                        [s.payload]:  {
                            [s.waterTemperature]: (cfg.isWater) ? temperature : null,
                            [s.airTemperature]: (!cfg.isWater) ? temperature : null
                        }
                    }]
                };

                udp.sendPacket(tempPacket);
                if (cfg.isWater) {
                    db.addWaterTemp(temperature);
                } else {
                    db.addAirTemp(temperature);
                }

            } else {
                logger.error('Temperature read error');
            }
        }, 1500);

    }, TEMP_INTERVAL);

    setInterval(function(){

        depthMean = depthSensor.getDepthMean();
        // Depth is within the acceptable range
        if (depthMean > 15 && depthMean < (DEPTH_VALUE_RANGE + 20)) {
            if (depthMean >= DEPTH_VALUE_RANGE) {

                depth = DEPTH_VALUE_RANGE;
                db.addDepth(depth);
            } else {
                zeroDepthSent = 0;
                depth = depthMean;
                db.addDepth(depth);
            }


            // Basket has risen from the rapid
            if (depth > DEPTH_VALUE_RANGE-1 && shiftTimestamp == 0) {
                logger.debug('Rising from the abyss');
                shiftTimestamp = Date.now();
                latestTime = Math.floor((Date.now() - startTimestamp)/1000);
            }

            // Basket has been sunken in the rapid
            else if (depth < DEPTH_VALUE_RANGE-1 && shiftTimestamp != 0) {
                logger.debug('Sinking into the abyss');
                startTimestamp = startTimestamp + Date.now() - shiftTimestamp;
                shiftTimestamp = 0;
                latestTime = Math.floor((Date.now() - startTimestamp)/1000);
            }

            // Basket is in the air
            else if (depth > DEPTH_VALUE_RANGE-1 && shiftTimestamp != 0) {

            }

            // Basket is in the rapid
            else {
                latestTime = Math.floor((Date.now() - startTimestamp)/1000);
            }

        } else {
            logger.error('Error! depthMean = ' + depthMean);
            return;
        };
    }, DEPTH_POLLING_INTERVAL);

    // Generate packets every second
    setInterval(function() {

        newGuild = db.getLatestGuild();
        // If the client just started no need for a reset
        if (latestGuild == undefined) {
            latestGuild = newGuild;

        } else if (newGuild != latestGuild) {
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
                        [s.time]: 0,
                        [s.isRed]: cfg.isRed ? s.true : s.false
                    }
                }]
            };
            udp.sendPacket(GuildPacket);
        }

        if (latestSendTime != latestTime) {
            if (zeroDepthSent != 0 && depth == DEPTH_VALUE_RANGE){
                return;

            } else if (depth == DEPTH_VALUE_RANGE) {
                zeroDepthSent = 1;
            }

            var UDPpacket = {
                [s.packets]: [
                {
                    [s.command]: s.depth,
                    [s.payload]:  {
                        [s.time]: latestTime,
                        [s.depth]: (DEPTH_VALUE_RANGE - depth).toFixed(1),
                        [s.isRed]: cfg.isRed ? s.true : s.false
                    }
                },

                {
                    [s.command]: s.guild,
                    [s.payload]: {
                        [s.guildName]: latestGuild.name,
                        [s.basket]: latestGuild.basket,
                        [s.time]: latestTime,
                        [s.isRed]: cfg.isRed ? s.true : s.false
                    }
                }]
            };

            // Send UDP-packet
            udp.sendPacket(UDPpacket);

            // Save basket current duration to database
            db.addDuration(latestTime);

            // Write important values to a backup file
            var toBackup = latestTime + ';' + startTimestamp + ';' + shiftTimestamp;
            fs.writeFile('latesttime.txt', JSON.stringify(toBackup), 'utf-8');
            latestSendTime = latestTime;
        }

    }, UDP_SEND_INTERVAL);

    // Start commandline
    prompt.commandLine();
}
