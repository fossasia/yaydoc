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

/**
 * Check if a user has admin permissions on a repository
 * @param repository: `full_name` of a repository
 * @param accessToken:  Access token of the user
 * @param callback
 */
exports.hasAdminAccess = function (repository, accessToken, callback) {
  request({
    url: 'https://api.github.com/repos/' + repository,
    headers: {
      'User-Agent': 'Yaydoc',
      'Authorization': 'token ' + crypter.decrypt(accessToken)
    }
  }, function (error, response, body) {
    var bodyJSON = JSON.parse(body);
    var adminPermission = bodyJSON.permissions.admin || false;
    callback(null, adminPermission);
  });
};

/**
 * Delete a Repository WebHook
 * @param name: name of the Repository
 * @param hook: Hook Id
 * @param accessToken: Access Token of the user
 * @param callback
 */
exports.deleteHook = function (name, hook, accessToken, callback) {
  request.delete({
    url: 'https://api.github.com/repos/' + name + '/hooks/' + hook,
    headers: {
      'User-Agent': 'Yaydoc',
      'Authorization': 'token ' + crypter.decrypt(accessToken)
    }
  }, function (error, result) {
    if (error) {
      callback(error);
    } else {
      callback(null);
    }
  });
};
