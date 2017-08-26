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
 * @param accessToken: Github Access Token of the user
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

/**
 * Check whether hook is registered to the repository or not
 * @param name: `full_name` of a repository
 * @param accessToken: Access Token of the user
 */
exports.hookValidator = function (name, accessToken) {
  return new Promise(function(resolve, reject) {
    request({
      url: `https://api.github.com/repos/${name}/hooks`,
      headers: {
        'User-Agent': 'Yaydoc',
        'Authorization': 'token ' + crypter.decrypt(accessToken)
      }
    }, function (error, response, body) {
      var isRegistered = false;
      if (response.statusCode !== 200) {
        console.log(response.statusCode + ': ' + response.statusMessage);
        reject()
      }
      var hooks = JSON.parse(body);
      var hookurl = 'http://' + process.env.HOSTNAME + '/ci/webhook';
      for (var i = 0; i < hooks.length; i++) {
        if (hooks[i].config.url === hookurl) {
          isRegistered = true;
          break;
        }
      }
      resolve({repositoryName: name, isRegistered: isRegistered})
    });
  });
};

/**
 * Register a hook to the repository for Yaydoc
 * @param {Object} data: Data of the repository
 * @param {String} data.name: full_name of the repository
 * @param {Boolean} data.sub: Flag to check whether the repository is sub project or not
 * @param accessToken: Access Token of the user
 */
exports.registerHook = function (data, accessToken) {
  return new Promise(function(resolve, reject) {
    var hookurl = 'http://' + process.env.HOSTNAME + '/ci/webhook';
    if (data.sub === true) {
      hookurl += `?sub=true`;
    }
    request({
      url: `https://api.github.com/repos/${data.name}/hooks`,
      headers: {
        'User-Agent': 'Yaydoc',
        'Authorization': 'token ' + crypter.decrypt(accessToken)
      },
      method: 'POST',
      json: {
        name: "web",
        active: true,
        events: [
          "push",
          "pull_request"
        ],
        config: {
          url: hookurl,
          content_type: "json"
        }
      }
    }, function(error, response, body) {
      if (response.statusCode !== 201) {
        console.log(response.statusCode + ': ' + response.statusMessage);
        resolve({status: false, body:body});
      } else {
        resolve({status: true, body: body});
      }
    });
  });
};

/**
 * Check if the .yaydoc.yml file is present or not
 * @param name: `full_name` of the repository
 * @param branch: Branch of the repository
 * @param callback
 */
exports.checkYaydocConfigurationInRepository = function (name, branch, callback) {
  request({
    url: 'https://api.github.com/repos/' + name + '/contents/.yaydoc.yml?ref=' + branch,
    headers: {
      'User-Agent': 'Yaydoc'
    }
  }, callback);
};


/**
 * Create status to the PR
 * @param commitId: commit sha
 * @param name: 'full_name' of the repository
 * @param state: state of the commit. accepted parameters are pending, success, failure, error
 * @param description: short description of the status
 * @param accessToken: Access Token of the user
 * @param targetURL: Target url of the the status
 * @param callback
 */
exports.createStatus = function(commitId, name, state, description, targetURL, accessToken, callback) {
  request.post({
    url: `https://api.github.com/repos/${name}/statuses/${commitId}`,
    headers: {
      'User-Agent': 'Yaydoc',
      'Authorization': 'token ' + crypter.decrypt(accessToken)
    },
    "content-type": "application/json",
    body: JSON.stringify({
      state: state,
      target_url: targetURL,
      description: description,
      context: "Yaydoc CI"
    })
  }, function(error, response, body) {
    if (error!== null) {
      return callback({description: 'Unable to create status'}, null);
    }
    callback(null, JSON.parse(body));
  });
}

/**
 * Get user details by taking username
 * @param userName: GitHub username
 */
exports.getUserDetail = function (userName, callback) {
  request({
    url: `https://api.github.com/users/${userName}`,
    headers: {
      'User-Agent': 'Yaydoc'
    }
  }, function (error, response, body) {
    if (error) {
      return callback(error, null);
    }
    callback(null, JSON.parse(body));
  });
}