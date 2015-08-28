var config = require('../../config');
var fs = require('fs');
var http = require('http');
var rimraf = require('rimraf');

// =============================================================================
// Declare file manager class

function FileManager() {
  var fileManager = this;

  // Init attributes
  fileManager.files = [];
  fileManager.files.add = fileManager.files.push;
  fileManager.files.remove = fileManager.files.shift;

  fileManager.running = 0;

  // Start file observer
  function start() {
    fileManager.process();
    setTimeout(start, config.refreshSpeedMs);
  }

  start();
}

// =============================================================================
// Add a file to download list

FileManager.prototype.download = function(fileInformation) {
  this.files.add(fileInformation);
};

// =============================================================================
// Process a waiting download

FileManager.prototype.process = function() {
  var fileManager = this;

  function onClearError(error) {
    console.error('>> Cannot clear temporary file');
    console.error(error);
  }

  function onDownloadError(error) {
    console.error('>> Download failed : ' + fileInformation.path);
    console.error(error);
    rimraf(fileInformation.subdir, onClearError);
    fileInformation.status = 'failed';
    fileManager.running--;
  }

  function onDownloadCompleted() {
    console.log('>> Download completed : ' + fileInformation.path);
    rimraf(fileInformation.subdir, onClearError);
    fileInformation.status = 'completed';
    fileManager.running--;
  }

  function moveDownloadedFile() {
    console.log('>> Moving temporary file : ' + fileInformation.path);

    var temporaryFile = fs.createReadStream(fileInformation.path);
    var finalFile = fs.createWriteStream(config.downloadPath + '/' + fileInformation.filename);

    temporaryFile.pipe(finalFile);
    temporaryFile.on('end', onDownloadCompleted);
    temporaryFile.on('error', onDownloadError);
  }

  function onDownloadStarted(httpResponse) {
    console.log('>> Download started : ' + fileInformation.path);

    fileInformation.totalByte = parseInt(httpResponse.headers['content-length'], 10);
    fileInformation.downloadedByte = 0;

    httpResponse.on('data', function(chunk) {
      fileInformation.downloadedByte += chunk.length;
    });

    var temporaryFile = fs.createWriteStream(fileInformation.path);
    httpResponse.pipe(temporaryFile);
    temporaryFile.on('finish', moveDownloadedFile);
  }

  try {
    // Check max parallel downloads
    if (fileManager.running >= config.maxParallelDownloads) {
      return;
    }

    // Get next file information
    var fileInformation = fileManager.files.remove();
    if (!fileInformation) {
      return;
    }

    // Tell a new thread as start
    fileManager.running++;

    // Create file system and start http request
    fs.mkdirSync(fileInformation.subdir);
    http
      .get(fileInformation.url, onDownloadStarted)
      .on('error', onDownloadError);
  } catch (e) {
    onDownloadError(e);
  }
};

module.exports = new FileManager();
