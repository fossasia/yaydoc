var exports = module.exports = {};

var async = require("async");
var mailer = require("./mailer");

Repository = require('../model/repository');
User = require('../model/user');
BuildLog = require('../model/buildlog');

exports.updateBuildStatus = function (name, buildNumber, buildStatus) {

  async.waterfall([
    function (callback) {
      BuildLog.setBuildStatus(name, buildNumber, buildStatus, function (error) {
        callback(error);
      })
    },
    function (callback) {
      Repository.setBuildStatusToRepository(name, buildStatus, function (error, repository) {
        if (!error) {
          callback(null, repository);
        }
      });
    },
    function (repository, callback) {
      if (repository.mailService === true && (repository.buildStatus === false || buildStatus === false || repository.buildStatus === undefined)) {
        User.getUserByUsername(repository.registrant.login, function (error, user) {
          callback(null, user, repository);
        });
      }
    }
  ], function (error, user, repository) {
    mailer.sendMailOnBuild(buildStatus, user.email, repository);
  });
};