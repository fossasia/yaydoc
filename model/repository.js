const mongoose = require("mongoose");
const repositorySchema = new mongoose.Schema({
  name: String,
  owner: {
    id: String,
    login: String
  },
  registrant: {
    id: String,
    login: String
  },
  accessToken: String,
  buildStatus: Boolean,
  mailService: Boolean,
  hook: String
});

const Repository = module.exports = mongoose.model('Repository', repositorySchema);

/**
 * Register a new repository
 * @param repository
 * @returns {Promise}
 */
module.exports.newRepository = function (repository) {
  return new Promise(function (resolve, reject) {
    new Repository(repository)
    .save(function (err, result) {
      console.log(err);
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
};

/**
 * Find a single repository
 * @param query
 * @returns {Promise}
 */
module.exports.findOneRepository = function(query) {
  return new Promise(function (resolve, reject) {
    Repository.findOne(query, function(err, result) {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
};

/**
 * Get repositories registered by a `registrant`
 * @param registrant
 * @param callback
 */
module.exports.getRepositoriesByRegistrant = function (registrant, callback) {
  Repository.find({
    'registrant.login': registrant
  }, callback);
};

/**
 * Get registered repositories owned by an `owner`
 * @param owner: Owner of the repository
 * @param callback
 */
module.exports.getRepositoriesByOwner = function (owner, callback) {
  Repository.find({
    'owner.login': owner
  }, callback);
};

/**
 * Get the build status of a Repository
 * @param name: `full_name` of the repository
 * @param callback
 */
module.exports.getBuildStatusByRepositoryName = function (name, callback) {
  Repository.findOne({name: name}, 'buildStatus', callback);
};

/**
 * Set the build status of a Repository
 * @param name: `full_name` of the repository
 * @param buildStatus
 * @param callback
 */
module.exports.setBuildStatusToRepository = function (name, buildStatus, callback) {
  Repository.findOneAndUpdate({name: name}, {$set: {buildStatus: buildStatus}}, callback);
};

/**
 * Get a single registered repository by `full_name`
 * @param name: `full_name` of a repository
 * @param callback
 */
module.exports.getRepositoryByName = function (name, callback) {
  Repository.findOne({name: name}, callback);
};

/**
 * Update the repository if hook is deleted
 * @param name: `full_name` of a repository
 * @param data: `token`, `id` and `login` of a user
 * @param callback
 */
module.exports.createOrUpdateRepository = function (name, data, callback) {
  Repository.findOneAndUpdate({name: name}, data, {upsert: true}, callback);
};

/**
 * Delete a registered repository by `name`
 * @param name: `full_name` of the repository
 * @param callback
 */
module.exports.deleteRepositoryByName = function (name, callback) {
  Repository.findOneAndRemove({name: name}, callback);
};
