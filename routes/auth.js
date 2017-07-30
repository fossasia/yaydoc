var express = require("express");
var router = express.Router();
var passport = require("passport");
var validation = require("../public/scripts/validation.js");

router.get("/github", function (req, res, next) {
  if (validation.isGithubHTTPS(req.query.gitURL)) {
    req.session.uniqueId = req.query.uniqueId;
    req.session.email = req.query.email;
    req.session.gitURL = req.query.gitURL;
    next();
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

router.post("/ci", function (req, res, next) {
    req.session.ci = true;
    next();
}, passport.authenticate('github', {
  scope: [
      'public_repo',
      'read:org',
      'write:repo_hook'
    ]
}));

router.get("/github/callback", passport.authenticate('github'), function (req, res, next) {
  if (req.session.ci) {
    req.session.ci = '';
    res.redirect("/dashboard");
  } else {
    req.session.token = req.user.token;
    res.redirect("/deploy/github");
  }
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

router.post('/logout', function (req, res, next) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
