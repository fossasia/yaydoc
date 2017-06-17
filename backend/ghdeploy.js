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
  var process = spawn("./publish_docs.sh", args);

  process.stdout.on('data', function (data) {
    console.log(data.toString());
    socket.emit('deploy-logs', {donePercent: donePercent, data: data.toString()});
    donePercent += 18;
  });

  process.stderr.on('data', function (data) {
    console.log(data.toString());
    socket.emit('err-logs', data.toString());
  });

  process.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    if (code === 0) {
      socket.emit('deploy-success', {pagesURL: "https://" + data.username + ".github.io/" + repoName});
    }
  });
}
