var express = require("express");
var router = express.Router();
var async = require("async");

var github = require('../backend/github');
var authMiddleware = require("../middleware/auth.js")
User = require('../model/user');
Repository = require('../model/repository');

router.get('/', authMiddleware.isLoggedIn, function (req, res, next) {
  User.getUserById(req.session.passport.user, function (err, user) {
    async.parallel({
      organizations: function(callback) {
        github.retrieveOrganizations(user.token, function (error, organizations) {
          callback(null, organizations);
        });
      },
      ownedRepositories: function (callback) {
        Repository.getRepositoriesByOwner(user.username, function (err, repositories) {
          callback(null, repositories);
        })
      }
    }, function(err, results) {
      res.render('dashboard', {
        title: 'Dashboard',
        user: user,
        organizations: results.organizations,
        ownedRepositories: results.ownedRepositories
      });
    });
  });
});


module.exports = router;
