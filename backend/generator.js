var exports = module.exports = {};

var mailer = require('./mailer');
var uuidV4 = require("uuid/v4");
var validation = require("../public/scripts/validation.js");
var spawn = require('child_process').spawn;
var output = require('../util/output');

exports.executeScript = function (socket, formData) {
  if (!validation.isValidForm(formData)) {
    socket.emit('err-logs', "Failed to generated documentation due to an error in input fields");
    return false;
  }
  var email = formData.email;
  var gitUrl = formData.gitUrl;
  var docTheme = formData.docTheme;
  var debug = formData.debug;
  var uniqueId = uuidV4();
  var webUI = "true";
  var subProject = "";
  var subDocpath = [];
  if (formData.subProject !== undefined) {
    subProject = formData.subProject.join(",");
    for(i=0; i<formData.subProject.length; i++){
        subDocpath.push('docs');
    }
  }

  const args = [
    "-g", gitUrl,
    "-t", docTheme,
    "-m", email,
    "-d", debug,
    "-u", uniqueId,
    "-w", webUI,
    "-s", subProject,
    "-p", subDocpath.join(",")
  ];

  var process = spawn("./generate.sh", args);

  output.lineOutput(socket, process, 'logs', 4);
  output.lineError(socket, process, 'err-logs');

  process.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    if (code === 0) {
      var data = { email: email, uniqueId: uniqueId, gitUrl: gitUrl };
      mailer.sendEmail(data);
      socket.emit('success', data);
    } else {
      socket.emit('failure', {errorCode: code});
    }
  });
  return true;
};
