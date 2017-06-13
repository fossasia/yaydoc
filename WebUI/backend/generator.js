var exports = module.exports = {};

var uuidV4 = require("uuid/v4");

exports.executeScript = function (socket, formData) {
  var spawn = require('child_process').spawn;
  
  var email = formData.email;
  var gitUrl = formData.gitUrl;
  var author = formData.author;
  var docTheme = formData.docTheme;
  var docPath = formData.docPath;
  var projectName = formData.projectName;
  var version = formData.version;
  var uniqueId = uuidV4();
  
  var donePercent = 0;
  
  const args = [
    "-g", gitUrl,
    "-a", author,
    "-t", docTheme,
    "-p", docPath,
    "-o", projectName,
    "-v", version,
    "-m", email,
    "-u", uniqueId
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
    }
  });
};