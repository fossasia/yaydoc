var express = require("express");
var router = express.Router();
var passport = require("passport");
var crypter = require("../util/crypter.js");
var validation = require("../public/scripts/validation.js");
var github = require('../backend/github');

/* GET home page. */
router.get("/", function(req, res, next) {
  var messages = {
    "1": "Thanks for registering with Yaydoc. Hereafter Documentation will be pushed to the GitHub pages on each commit.",
    "2": "Yaydoc is already integrated with this repository.",
    "3": "Failed to register repository."
  }
  var data = {
    title: "Yaydoc"
  };
  if(req.query.message !== undefined) {
    data.showMessage = true;
    data.message = messages[req.query.message];
  }
  if (req.query.ci === "true") {
    data.ci = true;
    data.username = req.query.username;
    github.retrieveOrgs(req.session.token, function (organisations) {
      data.organisations = organisations;
      return res.render("index", data);
    });
  } else {
    return res.render("index", data);
  }
});

/* Downloading Documentation as ZIP */
router.get('/download/:email/:uniqueId', function (req, res, next) {
  var file = __dirname + '/../temp/' + req.params.email + '/' + req.params.uniqueId + '.zip';
  res.download(file);
});

/* Download detailed logs created during documentation generation */
router.get('/logs/:email/:uniqueId', function (req, res, next) {
  var file = __dirname + '/../temp/' + req.params.email + '/' + req.params.uniqueId + '.txt';
  res.download(file);
});

module.exports = router;
