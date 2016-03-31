var _       = require('lodash');

var prompt  = require('./prompt');
var db      = require('./database');
var client  = require('./socket');

prompt.commandLine();

// Send test measurement packet every 500ms
var startTimestamp = Date.now();
setInterval(function() {
    var testJSON = {
        command: 'measurement',
        payload:  {
            time: (Date.now() - startTimestamp) / 1000,
            guild: _.isEmpty(db.getLatestGuild()) ? {name: 'koskIoTus', basket: ' '} : db.getLatestGuild(),
            depth: (_.random(0,2,true) * 100).toFixed(1)
        }
    };
    client.sendPacket(new Buffer(JSON.stringify(testJSON)));
}, 500);
