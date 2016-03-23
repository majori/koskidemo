var config = require('../config');
var logger = config.logger;
var schema = require('./schema');

db = {};

db.addGuild = function(guildName, basket) {
    var guild = new schema.models.Guild({
        name: 'autek',
        timestamp: Date.now(),
        basket: 2
    })
    .save();

    return guild;
};

db.fetchGuild = function(guildName) {
    return schema.collections.Guilds
    .query(qb => {
        qb.where({name: guildName})
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
        guild_id: guildId,
        cm: value
    })
    .save();

    return depth;
};

db.addTemperature = function(value) {

};

module.exports = db;
