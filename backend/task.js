const github = require("./github")
const queue = require("./queue")

User = require("../model/user");

exports.checkExpiredToken = function () {
  User.count(function (error, count) {
    if (error) {
      console.log(error);
    } else {
      var page = 0;
      if (count < 10) {
        page = 1;
      } else {
        page = count / 10;
        if (page * 10 < count) {
          page = (count + 10) /10;
        }
      }
      for (var i = 0; i <= page; i++) {
        User.paginateUsers(i, 10,
        function (error, users) {
          if (error) {
            console.log(error);
          } else {
            users.forEach(function(user) {
              queue.addTokenRevokedJob(user);
            })
          }
        })
      }
    }
  })
}
