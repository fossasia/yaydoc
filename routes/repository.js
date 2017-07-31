var express = require("express");
var router = express.Router();
var async = require("async");

var github = require("../backend/github");

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

module.exports = router;
