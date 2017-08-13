var exports = module.exports = {};

var mailer = require('./mailer');
var uuidV4 = require("uuid/v4");
var validation = require("../public/scripts/validation.js");
var spawn = require('child_process').spawn;
var socketHandler = require('../util/socketHandler.js');
var miscellaneous = require('../util/miscellaneous');
var deploy = require("./deploy");
var logger = require("../util/logger");

BuildLog = require('../model/buildlog');

exports.executeScript = function (socket, formData, callback) {
  if (!validation.isValidForm(formData)) {
    socketHandler.handleSocket(socket, 'err-logs', "Failed to generated documentation due to an error in input fields");
    return false;
  }
  var email = formData.email;
  var gitUrl = formData.gitUrl;
  var docTheme = formData.docTheme;
  var debug = formData.debug;
  var uniqueId = uuidV4();
  var targetBranch = formData.targetBranch === undefined ? '' : formData.targetBranch;
  var docPath = formData.docPath === undefined ? '' : formData.docPath;
  var subProject = "[]";
  var subDocpath = [];
  if (formData.subProject !== undefined) {
    subProject = "[" + formData.subProject.join(",") + "]";
    for(i=0; i<formData.subProject.length; i++){
        subDocpath.push("docs");
    }
  }

  const args = [
    "-g", gitUrl,
    "-t", docTheme,
    "-m", email,
    "-d", debug,
    "-u", uniqueId,
    "-s", subProject,
    "-p", "[" + subDocpath.join(",") + "]",
    "-b", targetBranch,
    "-l", docPath
  ];

  var spawnedProcess = spawn("./generate.sh", args);

  socketHandler.handleLineOutput(socket, spawnedProcess, 'logs', 4);
  socketHandler.handleLineError(socket, spawnedProcess, 'err-logs');

  spawnedProcess.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    var data = { code: code, email: email, uniqueId: uniqueId, gitUrl: gitUrl };
    if (code === 0) {
      data.exitCode = code;
      if (process.env.SURGE_LOGIN === undefined || process.env.SURGE_TOKEN === undefined) {
        data.previewURL = `/preview/${email}/${uniqueId}_preview`;
        logger.storeLogs(data, callback);
        socketHandler.handleSocket(socket, 'success', data);
      } else {
        deploy.deploySurge(data, process.env.SURGE_LOGIN, process.env.SURGE_TOKEN, function (error, result) {
          data.surgeSuccessFlag = false;
          if (error) {
            socketHandler.handleSocket(socket, 'failure', data);
          } else {
            data.previewURL = `https://${uniqueId}.surge.sh`;
            socketHandler.handleSocket(socket, 'success', data);
            data.surgeSuccessFlag = true;
          }
          data.surgeDeploy = true;
          logger.storeLogs(data, callback);
        });
      }
    } else {
      data.exitCode = code;
      socketHandler.handleSocket(socket, 'failure', data);
    }
  });
  return true;
};
