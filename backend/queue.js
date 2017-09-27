const github = require("./github.js");
const mailer = require("./mailer");
const async = require("async");
User = require("../model/user");
var tokenRevokedQueue = async.queue(function (user, done) {
  github.retriveUser(user.token, function (error, userData) {
    if (error) {
      if (user.expired === false) {
        mailer.sendMailOnTokenFailure(user.email);
        User.updateUserById(user.id, {
          expired: true
        }, function(error, data) {
          if (error) {
            console.log(error);
          }
        });
      }
      done();
    } else {
      done();
    }
  })
}, 2);

exports.addTokenRevokedJob = function(user) {
  tokenRevokedQueue.push(user);
};
