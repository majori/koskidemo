const express       = require('express')
const app           = express();
const server        = require('http').createServer(app);
const io            = require('socket.io')(server);
const favicon       = require('serve-favicon');
const compression   = require('compression');

var cfg     = require('../config');
var logger  = require('../logger');

// Configure middleware
app.use(compression());

// Configure static paths to www content
app.use(express.static(cfg.publicPath + '/views'));
app.use('/assets', express.static(cfg.publicPath + '/assets'));
app.use('/styles', express.static(cfg.publicPath + '/styles'));
app.use(favicon(cfg.publicPath + '/assets/img/favicon.ico'));

// Configure routes
app.get('/', function(req, res) {
    res.sendfile(cfg.publicPath + '/views/index.html');
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
