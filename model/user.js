const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  id: String,
  token: String,
  email: String,
  name: String,
  username: String
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
