var express = require('express');
var router = express.Router();

// =============================================================================
// Routes mapping

router.get('/', function(req, res) {
  var downloads = req.db.downloads;

  res.render('index', {
    downloads: downloads,
    downloadsCount: Object.keys(downloads).length,
  });
});

module.exports = router;
