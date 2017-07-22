var crypter = require("../util/crypter.js");
var spawn = require('child_process').spawn;
var output = require('../util/output');
var socketHandler = require('../util/socketHandler.js');

exports.deployPages = function (socket, data) {
  var gitUrlSplit = data.gitURL.split("/");
  var repoName = gitUrlSplit[4].split(".")[0];
  var owner = gitUrlSplit[3];
  var username = data.username;
  var oauthToken = crypter.decrypt(data.encryptedToken);
  var email = data.email;
  var uniqueId = data.uniqueId;

  const args = [
    "-e", email,
    "-i", uniqueId,
    "-n", username,
    "-t", oauthToken,
    "-r", repoName,
    "-o", owner
  ];

  var process = spawn("./ghpages_deploy.sh", args);

  socketHandler.handleLineOutput(socket, process, 'github-deploy-logs', 17);
  socketHandler.handleLineError(socket, process, 'github-err-logs');

  process.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    var data = {
      url: "https://" + owner + ".github.io/" + repoName,
      email: email,
      uniqueId: uniqueId,
      code: code
    };
    if (code === 0) {
      socketHandler.handleSocket(socket, 'github-success', data);
    } else {
      socketHandler.handleSocket(socket, 'github-failure', data);
    }
  });
};

exports.deployHeroku = function (socket, data) {
  var email = data.email;
  var herokuAppName = data.herokuAppName;
  var herokuAPIKey = crypter.decrypt(data.herokuAPIKey);
  var uniqueId = data.uniqueId;

  const args = [
    "-e", email,
    "-u", uniqueId,
    "-h", herokuAPIKey,
    "-n", herokuAppName,
  ];

  var process = spawn('./heroku_deploy.sh', args);

  output.lineOutput(socket, process, 'heroku-deploy-logs', 10);
  output.lineError(socket, process, 'heroku-error-logs');

  process.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    var data = {
      url: 'https://' + herokuAppName + '.herokuapp.com',
      email: email,
      uniqueId: uniqueId,
      code: code
    };
    if (code === 0) {
      socket.emit('heroku-success', data);
    } else {
      socket.emit('heroku-failure', data);
    }
  });

};
