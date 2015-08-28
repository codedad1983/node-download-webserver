var express = require('express');
var DatabaseManager = require('./services/databaseManager');
var FileManager = require('./services/fileManager');

var router = express.Router();

// =============================================================================
// Mapping part

router.get('/', function(req, res) {
  var databaseManager = new DatabaseManager(req.db);

  res.json(databaseManager.downloads);
});

router.post('/', function(req, res) {
  var databaseManager = new DatabaseManager(req.db);

  try {
    // Create file informations
    var fileInformation = databaseManager.newDownload(req.body.url);
    // Render response
    res.json(fileInformation);
    // Start downloading the file
    FileManager.download(fileInformation);
  } catch (error) {
    // Handle errors
    res.status(400).json({
      error: error
    });
  }
});

router.delete('/not-running', function(req, res) {
  var databaseManager = new DatabaseManager(req.db);

  // Delete old data
  databaseManager.deleteNotRunningDownloads();

  // Send a response to client
  res.json(databaseManager.downloads);
});

module.exports = router;
