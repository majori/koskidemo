var prompt  = require('prompt');
var colors  = require('colors/safe');
var _       = require('lodash');

var db      = require('./database');
var config  = require('../config');
var client  = require('./socket');
var logger  = config.logger;

var promptModule = {};

var INTERVAL_ID = null;

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
                    promptModule.nextBasket();
                break;

                case 'help':
                    logger.info('Komennot: kilta, kori');
                break;

                case 'testi':
                    INTERVAL_ID = testRun();
                    promptModule.commandLine();

                break;

                case 'reset':
                    if (!_.isNull(INTERVAL_ID)) {
                        clearInterval(INTERVAL_ID)
                        INTERVAL_ID = null;
                    }
                    client.sendPacket(new Buffer(JSON.stringify({command: 'reset_data'})));
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

var testRun = function() {
    var startTimestamp = Date.now();
    return setInterval(function() {
        var testJSON = {
            command: 'measurement',
            payload:  {
                time: (Date.now() - startTimestamp) / 1000,
                guild: _.isEmpty(db.getLatestGuild()) ? {name: 'kilta', basket: '1'} : db.getLatestGuild(),
                depth: (_.random(0,2,true) * 100).toFixed(1)
            }
        };
        client.sendPacket(new Buffer(JSON.stringify(testJSON)));
    }, 500);
};

//module.exports = promptModule;
module.exports = promptModule;
