const miscellaneous = require('./miscellaneous');
const mailer = require('../backend/mailer')
BuildLog = require('../model/buildlog');

/**
 * Store the generated logs
 * @param {Object} data : Data for storing logs
 * @param {String} data.uniqueId : Unique id of the build
 * @param {String} data.gitUrl : GIT URL of the repository
 * @param {String} data.surgeDeploy : Flag to check whether it is surge deploy or not
 * @param {String} data.surgeSuccessFlag : Flag to check whether it is deployed to surge or not
 * @param {String} data.email : email of the user
 * @param {Integer} data.exitCode : Exit code of the process
 */
exports.storeLogs = function(data, callback) {
  if (data.exitCode !== 0 && callback !== undefined) {
    BuildLog.storeGenerateLogs(reponame,
      'temp/' + email + '/generate_' + uniqueId + '.txt', function (error) {
        callback(error, data)
      });
    return callback({
      message: `Process exited with code : ${data.exitCode}`
    });
  }

  if (callback !== undefined) {
    BuildLog.storeGenerateLogs(miscellaneous.getRepositoryFullName(data.gitUrl),
      `temp/${data.email}/generate_${data.uniqueId}.txt`, function(error) {
        callback(error, data);
    });
    return;
  }
  if (!data.surgeDeploy ) {
    return mailer.sendEmail(data);
  }

  if (data.surgeSuccessFlag === true) {
    mailer.sendEmail(data);
  }
}
