var crypter = require("../util/crypter.js");
var spawn = require('child_process').spawn;
var output = require('../util/output');

exports.deployPages = function (socket, data) {
  var repoName = data.gitURL.split("/")[4].split(".")[0];
  var webUI = "true";
  var username = data.username;
  var oauthToken = crypter.decrypt(data.encryptedToken);

  const args = [
    "-e", data.email,
    "-i", data.uniqueId,
    "-w", webUI,
    "-n", username,
    "-o", oauthToken,
    "-r", repoName
  ];

  var process = spawn("./ghpages_deploy.sh", args);

  output.lineOutput(socket, process, 'deploy-logs', 18);
  output.lineError(socket, process, 'err-logs');

  process.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    if (code === 0) {
      socket.emit('github-success', {pagesURL: "https://" + data.username + ".github.io/" + repoName});
    } else {
      socket.emit('github-failure', {errorCode: code});
    }
  });
};

exports.deployHeroku = function (socket, data) {
  var email = data.email;
  var herokuAppName = data.herokuAppName;
  var webUI = "true";
  var herokuAPIKey = crypter.decrypt(data.herokuAPIKey);
  var uniqueId = data.uniqueId;
  
  const args = [
    "-e", email,
    "-u", uniqueID,
    "-w", webUI,
    "-h", herokuAPIKey,
    "-n", herokuAppName,
  ];

  var process = spawn('./heroku_deploy.sh', args);

  output.lineOutput(socket, process, 'heroku-deploy-logs', 7);
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
