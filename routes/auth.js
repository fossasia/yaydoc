var express = require("express");
var router = express.Router();
var passport = require("passport");
var validation = require("../public/scripts/validation.js");

router.get("/github", function (req, res, next) {
  if (validation.isGithubHTTPS(req.query.gitURL)) {
    req.session.uniqueId = req.query.uniqueId;
    req.session.email = req.query.email;
    req.session.gitURL = req.query.gitURL;
    next()
  } else {
    next({
      message: "Invalid github url",
      status: 400
    })
  }
}, passport.authenticate('github', {
  scope: [
    'public_repo',
    'read:org'
  ]
}));

router.get("/github/callback", passport.authenticate('github'), function (req, res, next) {
  req.session.username = req.user.username;
  req.session.token = req.user.token;
  res.redirect("/deploy/github");
});

router.get('/heroku', function(req, res, next){
  req.session.uniqueId = req.query.uniqueId;
  req.session.email = req.query.email;
  next();
}, passport.authenticate('heroku'));

router.get('/heroku/callback', passport.authenticate('heroku'), function(req, res) {
  req.session.herokuAPIKey = req.user.token;
  res.redirect('/deploy/heroku');
});

module.exports = router;