const mongoose = require("mongoose");
const repositorySchema = new mongoose.Schema({
  name: String,
  username: String,
  githubId: String,
  accessToken: String,
  email: String
})

const model = mongoose.model('repository', repositorySchema);

exports.newRepository = function (name, username, githubId, accessToken, email) {
  return new Promise(function (resolve, reject) {
    new model({
      name: name,
      username: username,
      githubId: githubId,
      accessToken: accessToken,
      email: email
    })
    .save(function (err, result) {
      console.log(err);
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

exports.findOneRepository = function(query) {
  return new Promise(function (resolve, reject) {
    model.findOne(query, function(err, result) {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}
