var express = require("express");
var router = express.Router();
var passport = require("passport");
var crypter = require("../util/crypter.js");
var validation = require("../public/scripts/validation.js");

/* GET home page. */
router.get("/", function(req, res, next) {
  if (req.user) {
    return res.redirect('/dashboard');
  }

  res.render("index", {
    title: "Yaydoc | Automatic Documentation Generation and Deployment"
  });
});

/* Downloading Documentation as ZIP */
router.get('/download/:email/:uniqueId', function (req, res, next) {
  var file = __dirname + '/../temp/' + req.params.email + '/' + req.params.uniqueId + '.zip';
  res.download(file);
});

/* Download detailed logs created during documentation generation */
router.get('/logs/:type/:email/:uniqueId', function (req, res, next) {
  var file = __dirname + '/../temp/' + req.params.email + '/' + req.params.type + '_' + req.params.uniqueId + '.txt';
  res.download(file);
});

module.exports = router;
