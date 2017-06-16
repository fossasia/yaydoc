var exports = module.exports = {};

var uuidV4 = require("uuid/v4");
var validation = require("../public/scripts/validation.js");

exports.executeScript = function (socket, formData) {
  if (!validation.isValid(formData)) {
    socket.emit('err-logs', "Failed to generated documentation due to an error in input fields");
    return false;
  }
  var spawn = require('child_process').spawn;

  var email = formData.email;
  var gitUrl = formData.gitUrl;
  var docTheme = formData.docTheme;
  var uniqueId = uuidV4();
  var webUI = "true"

  var donePercent = 0;

  const args = [
    "-g", gitUrl,
    "-t", docTheme,
    "-m", email,
    "-u", uniqueId,
    "-w", webUI
  ];

  var process = spawn("./generate.sh", args);

  process.stdout.on('data', function (data) {
    console.log(data.toString());
    socket.emit('logs', {donePercent: (donePercent = donePercent + 4), data: data.toString()});
  });

  process.stderr.on('data', function (data) {
    console.log(data.toString());
    socket.emit('err-logs', data.toString());
  });

  process.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    if (code === 0) {
      socket.emit('success', {email: email, uniqueId: uniqueId});
    } else {
      socket.emit('failure', {errorCode: code});
    }
  });
  return true;
};