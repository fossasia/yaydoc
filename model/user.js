const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  id: String,
  token: String,
  email: String,
  name: String,
  username: String,
  expired: Boolean
});

const User = module.exports = mongoose.model('User', userSchema);

/**
 * Get User information by Github's User Id
 * @param id: User's Github id
 * @param callback
 */
module.exports.getUserById = function(id, callback) {
  User.findOne({id: id}, callback);
};

/**
 * Get User information by Github Username
 * @param username: User's Github username
 * @param callback
 */
module.exports.getUserByUsername = function(username, callback) {
  User.findOne({username: username}, callback);
};

/**
 * Count the number of repository
 */

module.exports.countUsers = function (callback) {
  User.count({}, callback);
};

/**
 * paginates repositories
 * @param page: n'th page
 * @param limit: limit for number of repository to return
 */

module.exports.paginateUsers = function (page, limit, callback) {
  var skip = 0;
  if (page > 1) {
    skip = page * limit;
  }
  User.find({}).skip(skip).limit(limit).exec(callback);
};

/**
 * Update the user by Github's Users id
 * @param id: Github's user id
 * @param update: user update
 */
module.exports.updateUserById = function(id, update, callback) {
  User.update({id: id}, update, function(error, data) {
    callback(error, data);
  });
};
