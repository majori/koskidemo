var prompt  = require('prompt');
var colors  = require('colors/safe');
var _       = require('lodash');

var db      = require('./database');
var config  = require('../config');
var client  = require('./socket');
var logger  = require('../logger');

var promptModule = {};

var INTERVAL_ID = null;
var START_TIMESTAMP = 0;
const s = config.udpSchema;

promptModule.addGuild = function() {
    prompt.get({
        properties: {
            nimi: {
                description: colors.green('Syötä killan nimi'),
                required: true,
                type: 'string'
            },
            kori: {
                description: colors.green('Syötä korin numero'),
                type: 'integer',
                default: 1
            }
        }
    }, function(err, result) {
        if (!err) {
            db.addGuild(result.nimi, result.kori)
            .then(() => {
                logger.info('Guild "' + result.nimi + '" in basket ' + result.kori + ' added succesfully!');
                promptModule.commandLine();
            });
        } else {
            logger.error('Error on promptModule.addGuild: ' + err);
        }
    });
};

promptModule.nextBasket = function() {
    var latestGuild = db.getLatestGuild();
    db.addGuild(latestGuild.name, parseInt(latestGuild.basket) + 1)
    .then(() => {
        logger.info('Previous guild added with new basket');
        promptModule.commandLine();
    });
};

promptModule.commandLine = function() {
    prompt.message = colors.red('koskiotus');
    prompt.delimiter = '>'
    prompt.start();

    prompt.get({
        properties: {
            komento: {
                description: 'Syötä komento'
            }
        }
    }, function(err, result) {
        if (!err) {
            switch (result['komento']) {
                case 'kilta':
                    promptModule.addGuild();
                break;

                case 'kori':
                    resetData();
                    promptModule.nextBasket();
                break;

                case 'help':
                    logger.info('Komennot: kilta, kori');
                break;

                case 'testi':
                    if (_.isNull(INTERVAL_ID)) {
                        START_TIMESTAMP = Date.now();
                        INTERVAL_ID = testRun();
                    }
                    promptModule.commandLine();

                break;

                case 'reset':
                    if (!_.isNull(INTERVAL_ID)) {
                        clearInterval(INTERVAL_ID)
                        INTERVAL_ID = null;
                    }
                    resetData();
                    promptModule.commandLine();
                break;

                case 'reset-rank':
                    client.sendPacket(new Buffer(JSON.stringify({command: 'reset-rank'})));
                    promptModule.commandLine();
                break;

                default:
                    logger.info('Komentoa ' + result['komento'] + ' ei löytynyt. '
                        + 'Löydät saatavat komennot "help" komennolla');
                    promptModule.commandLine();
            }
        } else {
            logger.error('Error on promptModule.commandLine: ' + err);
        }
    });
};

function testRun() {

    return setInterval(function() {
        var latestTime = (Date.now() - START_TIMESTAMP) / 1000;
        var latestGuild = db.getLatestGuild();
        var testPacket = {
            [s.packets]: [
            {
                [s.command]: s.measurement,
                [s.payload]:  {
                    [s.time]: latestTime,
                    [s.depth]: (_.random(0,2,true) * 100).toFixed(1),
                    [s.waterTemperature]: 4.4,
                    [s.airTemperature]: 13.3
                }
            }, {
                [s.command]: s.guild,
                [s.payload]: {
                    [s.guildName]: latestGuild.name,
                    [s.basket]: latestGuild.basket,
                    [s.time]: latestTime
                }
            }]
        };
        client.sendPacket(testPacket);

    }, 1000);
};

function resetData() {
    START_TIMESTAMP = Date.now();
    client.sendPacket(new Buffer(JSON.stringify({command: 'reset-data'})));
};

//module.exports = promptModule;
module.exports = promptModule;
