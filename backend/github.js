var exports = module.exports = {};
var request = require("request");

/**
 * Retrieve a list of organisation the user has access to
 * @param accessToken: Access Token of the user
 * @param callback: Returning the list of organisations
 */
exports.retrieveOrgs = function (accessToken, callback) {
  request({
    url: 'https://api.github.com/user/orgs',
    headers: {
      'User-Agent': 'request',
      'Authorization': 'token ' + accessToken
    }
  }, function (error, response, body) {
    var organisations = [];
    var bodyJSON = JSON.parse(body);
    bodyJSON.forEach(function (organisation) {
      organisations.push(organisation.login);
    });
    return callback(organisations);
  });
};
