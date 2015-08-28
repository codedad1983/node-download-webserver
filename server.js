var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var downloadApiRoutes = require('./routes/downloadApi');
var webRoutes = require('./routes/web');
var fsChecker = require('./service/fsChecker');

var config = require('./config');

// Prepare file system
fsChecker.prepare();

// Create and configure server
var app = express();

// Setup RAM database
var database = {
  downloads: {}
};
app.use(function(req, res, next) {
  req.db = database;
  next();
});

// Setup middleware
app.use(express.static('public'));
app.use(morgan('combined'));
app.use(bodyParser.json());

// Setup template engine
app.set('view engine', 'jade');

// Setup routes
app.use('/', webRoutes);
app.use('/api/download', downloadApiRoutes);

// Start server
var server = app.listen(config.server.port, function () {
  var port = server.address().port;
  console.log('>> Server listening at %s', port);
});
