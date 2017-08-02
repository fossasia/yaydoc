var express = require("express");
var router = express.Router();
var async = require("async");
var github = require("../backend/github");
var authMiddleware = require("../middleware/auth.js");

Repository = require("../model/repository");

router.post('/delete', function (req, res, next) {
  var name = req.body.name || '';

  if (name === '') {
    return res.redirect('/dashboard?status=delete_failure');
  }

  async.waterfall([
    function (callback) {
      Repository.getRepositoryByName(name, function (error, repository) {
        callback(error, repository);
      });
    },
    function (repository, callback) {
      Repository.deleteRepositoryByName(name, function (error) {
        callback(error, repository);
      })
    },
    function (repository, callback) {
      github.deleteHook(repository.name, repository.hook, req.user.token, function (error) {
        callback(error);
      })
    }
  ], function (error, result) {
    if (error) {
      return res.redirect('/dashboard?status=delete_failure');
    }
    return res.redirect('/dashboard?status=delete_success');
  });
});


router.post("/disable", authMiddleware.isLoggedIn, function(req, res, next) {
  var query = {
    name: req.body.repository
  };
  Repository.updateRepository(query, {
    enable: false
  })
  .then(function () {
    res.redirect("/dashboard?status=disabled_successful")
  })
  .catch(function () {
    next({
      status: 500,
      messages: 'Something went wrong'
    });
  });
});

router.post("/enable", authMiddleware.isLoggedIn, function(req, res, next) {
  var query = {
    name: req.body.repository
  };
  Repository.updateRepository(query, {
    enable: true
  })
  .then(function () {
    res.redirect("/dashboard?status=enabled_successful")
  })
  .catch(function () {
    next({
      status: 500,
      messages: 'Something went wrong'
    });
  });
});

module.exports = router;
