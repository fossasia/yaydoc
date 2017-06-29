var express = require("express");
var router = express.Router();
var passport = require("passport");
var crypter = require("../util/crypter.js");
var validation = require("../public/scripts/validation.js");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Yaydoc" });
});

/* Downloading Documentation as ZIP */
router.get('/download/:email/:uniqueId', function (req, res, next) {
  var file = __dirname + '/../temp/' + req.params.email + '/' + req.params.uniqueId + '.zip';
  res.download(file);
});

module.exports = router;
