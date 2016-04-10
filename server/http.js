var express = require('express')
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);
var favicon = require('serve-favicon');

var cfg     = require('../config');
var logger  = require('../logger');

// Configure static paths to www content
app.use(express.static(cfg.publicPath + '/views'));
app.use('/assets', express.static(cfg.publicPath + '/assets'));
app.use('/styles', express.static(cfg.publicPath + '/styles'));
app.use(favicon(cfg.publicPath + '/assets/img/favicon.ico'));

// Configure routes
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/views/index.html');
});

// Set up Socket.IO
server.listen(cfg.ioPort, cfg.httpAddress, function() {
    logger.info('Socket.IO listening on port ' + cfg.httpAddress + ':' + cfg.ioPort);
});

// Set up express server
app.listen(cfg.httpPort, cfg.httpAddress, function() {
    logger.info('Listening HTTP on address ' + cfg.httpAddress + ':' + cfg.httpPort);
});


module.exports = {
    io,
    app,
};
