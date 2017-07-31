var express = require("express");
var router = express.Router();
var passport = require("passport");
var crypter = require("../util/crypter.js");

router.get("/github", function (req, res, next) {
  res.render("deploy/github", {
    email: req.session.email,
    gitURL: req.session.gitURL,
    uniqueId: req.session.uniqueId,
    token: req.session.token,
    username: req.session.username
  });
});

router.get('/heroku', function (req, res, next) {
  res.render("deploy/heroku", {
    email: req.session.email,
    uniqueId: req.session.uniqueId,
    herokuAPIKey: crypter.encrypt(req.session.herokuAPIKey),
  });
});

module.exports = router;
