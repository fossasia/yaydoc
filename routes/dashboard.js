var express = require("express");
var router = express.Router();

var github = require('../backend/github');

User = require('../model/user');

router.get('/', isLoggedIn, function (req, res, next) {
  User.getUserById(req.session.passport.user, function (err, user) {
    github.retrieveOrgs(user.token, function (organizations) {
      res.render('dashboard', {
        title: 'Dashboard',
        user: user,
        organizations: organizations
      });
    });
  });
});

function isLoggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/');
  }
}

module.exports = router;
