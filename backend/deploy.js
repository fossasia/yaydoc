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

  const args = [
    "-e", data.email,
    "-i", data.uniqueId,
    "-n", username,
    "-t", oauthToken,
    "-r", repoName,
    "-o", owner
  ];

  var process = spawn("./ghpages_deploy.sh", args);

  socketHandler.handleLineOutput(socket, process, 'github-deploy-logs', 18);
  socketHandler.handleLineError(socket, process, 'github-err-logs');

  process.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    if (code === 0) {
      socketHandler.handleSocket(socket, 'github-success', {pagesURL: "https://" + data.username + ".github.io/" + repoName});
    } else {
      socketHandler.handleSocket(socket, 'github-failure', {errorCode: code});
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

  output.lineOutput(socket, process, 'heroku-deploy-logs', 11);
  output.lineError(socket, process, 'heroku-error-logs');

  process.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    if (code === 0) {
      socket.emit('heroku-success', {url: 'https://' + herokuAppName + '.herokuapp.com'});
    } else {
      socket.emit('heroku-failure', {errorCode: code});
    }
  });

};
