var uuid = require('node-uuid');
var config = require('../../config');

// =============================================================================
// Class declaration

function DatabaseManager(database) {
  this.database = database;
  this.downloads = database.downloads;
}

// =============================================================================
// File information method creation

DatabaseManager.prototype.newDownload = function(url) {
  // Get url request
  if (!url) {
    throw new Error('Missing file url argument');
  }

  // Read filename
  var urlElement = url.split('/');
  if (urlElement.length === 0) {
    throw new Error('Bad file url');
  }

  var filename = urlElement[urlElement.length - 1];
  if (!filename) {
    throw new Error('Bad file url');
  }

  // Create temporary random subdir
  var subdir = config.temporaryDownloadPath + '/' + uuid.v4();

  // Create file information
  var fileInformation = {
    url: url,
    filename: filename,
    subdir: subdir,
    path: subdir + '/' + filename,
    status: 'started'
  };

  // Save information to database
  this.downloads[uuid.v4()] = fileInformation;

  // Return the object
  return fileInformation;
};

// =============================================================================
// Delete completed and failed downloads

DatabaseManager.prototype.deleteNotRunningDownloads = function() {
  for (var id in this.downloads) {
    if (this.downloads[id].status != 'started') {
      delete this.downloads[id];
    }
  }
};

module.exports = DatabaseManager;
