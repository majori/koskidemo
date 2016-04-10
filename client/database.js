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


db.addDepth = function(value, guildId) {

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

module.exports = db;
