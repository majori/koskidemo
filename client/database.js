var _       = require('lodash');

var config  = require('../config');
var schema  = require('./schema');
var logger  = config.logger;

var db = {};

// Save latest added guild to this variable. This way measurements knows which id
// to use in guild_id without fetching latest guild every time
var latestGuild_ = {};

// Add new guild and update latestGuild_
db.addGuild = function(guildName, basket) {

    return new Promise(function(resolve,reject) {
        var guild = new schema.models.Guild({
            name: guildName,
            timestamp: Date.now(),
            basket: basket
        })
        .save()
        .then(() => {
            db.updateLatestGuild()
            .then(() => resolve());
        })
    });
};

db.fetchGuildById = function(guildId) {

    return schema.collections.Guilds
    .query(qb => {
        qb.where({id: guildId})
    })
    .fetchOne();
};

db.fetchNewestGuild = function() {

    var subquery = schema.bookshelf
    .knex('guilds')
    .max('timestamp');

    return schema.bookshelf
    .knex('guilds')
    .where('timestamp', subquery);
};


db.addDepth = function(value, guildId) {

    var depth = new schema.models.Depth({
        timestamp: Date.now(),
        guild_id: latestGuild_.id,
        cm: value
    })
    .save();

    return depth;
};

db.addTemperature = function(value) {

};

db.getLatestGuild = function() {

    return (!_.isEmpty(latestGuild_)) ?
        latestGuild_ : {
            name: '',
            basket: ''
        };
};

db.updateLatestGuild = function() {

    return new Promise(function(resolve,reject) {
        db.fetchNewestGuild()
        .then(function(model) {
            latestGuild_ = model[0];
            logger.debug('Last guild updated, name: ' + model[0].name
                + ', basket ' + model[0].basket);
            resolve();
        });
    });
};

module.exports = db;
