const prompt    = require('prompt');
const colors    = require('colors/safe');
const _         = require('lodash');
const Promise   = require('bluebird');

var db      = require('./database');
var udp     = require('./udp');
var cfg     = require('../config');
var logger  = require('../logger');

var promptModule = {};

var INTERVAL_ID = null;
var START_TIMESTAMP = 0;

const s = cfg.udpSchema;
const COLOR = (cfg.isRed) ? 'Red' : 'Blue';

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
                    resetData();
                    promptModule.commandLine();
                break;

                case 'reset-rank':
                    udp.sendPacket({[s.packets]: [ {[s.command]: s.resetRank} ]});
                    promptModule.commandLine();
                break;

                case 'restore':
                    var hoursBefore = 24;

                    db.fetchRanksSinceTimestamp(Date.now()-(hoursBefore*60*60*1000))
                    .then(models => {

                        var UDPpacket = { [s.packets]: [] };
                        _.forEach(models, model => {
                            UDPpacket[s.packets].push({
                                [s.command]: s.guild,
                                [s.payload]: {
                                    [s.guildName]: model.name,
                                    [s.basket]: model.basket,
                                    [s.time]: model.value
                                }
                            });
                        });
                        udp.sendPacket(UDPpacket)
                        .then(() => logger.info('Rank data restored'))
                        .catch((err) => logger.error('Rank data restore failed: ' + err));
                    });

                    promptModule.commandLine();
                break;

                case 'tes':
                    db.addDuration(Math.round(Math.random()*100));
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
        var latestTime = Math.round((Date.now() - START_TIMESTAMP) / 1000);
        var latestGuild = db.getLatestGuild();
        var testPacket = {
            [s.packets]: [
            {
                [s.command]: s.depth,
                [s.payload]:  {
                    [s.isRed]: (latestTime % 2 === 0) ? s.true : s.false,
                    [s.time]: latestTime,
                    [s.depth]: (_.random(0,2,true) * 100).toFixed(1)
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
        udp.sendPacket(testPacket);

    }, 1000);
};

function resetData() {
    if (!_.isNull(INTERVAL_ID)) {
        clearInterval(INTERVAL_ID)
        INTERVAL_ID = null;
    }
    START_TIMESTAMP = Date.now();
    udp.sendPacket({
        [s.packets]: [
        {
            [s.command]: s['reset' + COLOR]
        }]
    });
};

//module.exports = promptModule;
module.exports = promptModule;
