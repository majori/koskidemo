var _       = require('lodash');

var config  = require('../config');
var schema  = require('./schema');
var logger  = require('../logger');

var db = {};

// Save latest added guild to this variable. This way measurements knows which id
// to use in guild_id without fetching latest guild every time
var latestGuild_ = {
    id: null,
    timestamp: null,
    name: null,
    basket: null
};

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


db.addDepth = function(value) {

    var depth = new schema.models.Depth({
        timestamp: Date.now(),
        guild_id: latestGuild_.id,
        value: value
    })
    .save();

    return depth;
};

db.addWaterTemp = function(value) {
    var temp = new schema.models.WaterTemp({
        timestamp: Date.now(),
        guild_id: latestGuild_.id,
        value: value
    })
    .save();

    return temp;
};

db.addAirTemp = function(value) {
    var temp = new schema.models.AirTemp({
        timestamp: Date.now(),
        guild_id: latestGuild_.id,
        value: value
    })
    .save();



    return temp;
};

db.addDuration = function(value) {

    schema.collections.Durations
    .query(qb => {
        qb.where({guild_id: latestGuild_.id})
    })
    .fetchOne()
    .then(model => {

        if (model) {
            var id = model.get('id');

            return schema.models.Duration.forge({ id: id })
            .save({timestamp: Date.now(), value: value});
        } else {

            return schema.models.Duration.forge({
                guild_id: latestGuild_.id,
                timestamp: Date.now(),
                value: value
            }).save();
        }
    });
};

db.getLatestGuild = function() {

    return latestGuild_;
};

db.updateLatestGuild = function() {

    return new Promise(function(resolve,reject) {
        db.fetchNewestGuild()
        .then(function(model) {
            latestGuild_ = model[0];
            logger.debug('Last guild updated, name: ' + latestGuild_.name
                + ', basket ' + latestGuild_.basket);
            resolve();
        });
    });
};

db.fetchRanksSinceTimestamp = function(timestamp) {

    return schema.bookshelf
        .knex('durations')
        .where('durations.timestamp', '>', timestamp)
        .join('guilds', 'guild_id', '=', 'guilds.id')
        .select('guilds.name', 'guilds.basket', 'durations.value');
};

module.exports = db;
