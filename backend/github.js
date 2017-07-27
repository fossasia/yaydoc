var exports = module.exports = {};
var request = require("request");
var async = require("async");

var crypter = require("../util/crypter");

Repository = require('../model/repository');

/**
 * Retrieve a list of organization the user has access to
 * Along with the organizations, also retrieve registered repositories
 * @param accessToken: Access Token of the user
 * @param callback: Returning the list of organisations
 */
exports.retrieveOrganizations = function (accessToken, callback) {
  async.waterfall([
    function (callback) {
      request({
        url: 'https://api.github.com/user/orgs',
        headers: {
          'User-Agent': 'request',
          'Authorization': 'token ' + crypter.decrypt(accessToken)
        }
      }, function (error, response, body) {
        var organizations = [];
        var bodyJSON = JSON.parse(body);
        bodyJSON.forEach(function (organization) {
          organizations.push({
            id: organization.id,
            name: organization.login,
            avatar: organization.avatar_url
          });
        });
        return callback(null, organizations);
      });
    },
    function (organizations, callback) {
      var update = [];
      async.forEachOf(organizations, function (value, key, callback) {
        Repository.getRepositoriesByOwner(value.name, function (error, repositories) {
          value.repositories = repositories;
          update.push(value);
          callback();
        });
      }, function (err) {
        if (err) {
          console.error(err.message);
        }
        callback(null, update);
      });
    }
  ], function (error, result) {
    callback(null, result);
  });
};
