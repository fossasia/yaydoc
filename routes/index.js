var express = require("express");
var router = express.Router();
var passport = require("passport");
var crypter = require("../util/crypter.js");
var validation = require("../public/scripts/validation.js");

Repository = require("../model/repository");

/* GET home page. */
router.get("/", function(req, res, next) {
  var isLoggedIn = false;
  if (req.user) {
    isLoggedIn = true;
  }

  res.render("index", {
    title: "Yaydoc | Automatic Documentation Generation and Deployment",
    isLoggedIn: isLoggedIn,
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

/* Generate SVG image for build status of repository */
router.get('/:owner/:reponame.svg', function (req, res, next) {
  Repository.getBuildStatusByRepositoryName(req.params.owner + '/' + req.params.reponame, function (error, result) {
    var buildStatus = 'invalid';
    var width = '94';
    var color = '#9f9f9f';
    var x = '70.5';
    if (result === null || error) {
      res.status(404);
    } else {
      if (result.buildStatus) {
        buildStatus = 'success';
        width = '102';
        color = '#97CA00';
        x = '74.5';
      } else {
        buildStatus = 'failed';
        width = '88';
        color = '#E05d44';
        x = '67.5'
      }
    }

    res.set('Content-Type', 'image/svg+xml');
    res.render("badge", {
      status: buildStatus,
      width: width,
      color: color,
      x: x,
    });
  });
});

module.exports = router;
