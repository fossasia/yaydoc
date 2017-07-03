var crypter = require("../util/crypter.js")
var spawn = require('child_process').spawn;

exports.deployPages = function (socket, data) {
  var donePercent = 0;
  var repoName = data.gitURL.split("/")[4].split(".")[0];
  var webUI = "true";
  var username = data.username
  var oauthToken = crypter.decrypt(data.encryptedToken)

  const args = [
    "-e", data.email,
    "-i", data.uniqueId,
    "-w", webUI,
    "-n", username,
    "-o", oauthToken,
    "-r", repoName
  ];

  var process = spawn("./ghpages_deploy.sh", args);

  process.stdout.on('data', function (data) {
    console.log(data.toString());
    socket.emit('github-deploy-logs', {donePercent: donePercent, data: data.toString()});
    donePercent += 18;
  });

  process.stderr.on('data', function (data) {
    console.log(data.toString());
    socket.emit('github-error-logs', data.toString());
  });

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
  var donePercent = 0;
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

  process.stdout.on('data', function (data) {
    socket.emit('heroku-deploy-logs', {donePercent: donePercent, data: data.toString()});
    donePercent += 7;
  });

  process.stderr.on('data', function (data) {
    socket.emit('heroku-error-logs', data.toString());
  });

  process.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    if (code === 0) {
      socket.emit('heroku-success', {url: 'https://' + herokuAppName + '.herokuapp.com'});
    } else {
      socket.emit('heroku-failure', {errorCode: code});
    }
  });

};
