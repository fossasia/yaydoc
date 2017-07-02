var express = require("express");
var router = express.Router();
var passport = require("passport");
var crypter = require("../util/crypter.js");
var validation = require("../public/scripts/validation.js");

/* GET home page. */
router.get("/", function(req, res, next) {
  var messages = {
    "1": "Thanks for registering with Yaydoc.Hereafter Documentation will be pushed to the GitHub pages on each commit.",
    "2": "Yaydoc is already integrated with this repository."
  }
  var data = {
    title: "Yaydoc"
  };
  if(req.query.message !== undefined) {
    data.showMessage = true;
    data.message = messages[req.query.message];
  }
  if (req.query.repos != undefined) {
    data.ciModal = true;
    data.repos = req.query.repos;
  }
  res.render("index", data);
});

/* Downloading Documentation as ZIP */
router.get('/download/:email/:uniqueId', function (req, res, next) {
  var file = __dirname + '/../temp/' + req.params.email + '/' + req.params.uniqueId + '.zip';
  res.download(file);
});

module.exports = router;
