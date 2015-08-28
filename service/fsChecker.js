var fs = require('fs');
var config = require('../config');

function createFolder(path) {
  try {
    console.log(">> Setting up folder : %s", path);
    fs.mkdirSync(path);
  } catch (ex) {
    console.error(">> Folder creation error.");
    console.error(ex);
  }
}

module.exports.prepare = function() {
  createFolder(config.downloadPath);
  createFolder(config.temporaryDownloadPath);
};
