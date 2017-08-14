const mongoose = require("mongoose");

BuildLog = require('./buildlog');

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
  mailService:{
    status: Boolean,
    email: String
  },
  hook: [String],
  enable: {
    type: Boolean,
    default: true
  },
  builds: {
    type: Number,
    default: 0,
  },
  subRepositories:{
    type: [String],
    default: []
  }
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
 * Update repository
 * @param query: condition for selecting collection
 * @param update: data to be updated
 * @returns {Promise}
 */
module.exports.updateRepository = function(query, update) {
  return new Promise(function (resolve, reject) {
    Repository.update(query, update, function(err, result) {
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

/**
 * Increment the build number for a registered repository
 * @param name: `full_name` of the repository
 * @param callback
 */
module.exports.incrementBuildNumber = function (name, callback) {
  Repository.findOne({name: name}, 'builds', function (error, repository) {
    if (error) {
      callback(error);
    } else {
      repository.builds += 1;
      repository.save(function (error, repository) {
        callback(error, repository);
      })
    }
  })
};

/**
 * Get a single repository with a log history of 10 logs
 * @param name: `full_name` of the repository
 * @param callback
 */
module.exports.getRepositoryWithLogs = function (name, callback) {
  Repository.aggregate([
    { $match: {name: name}},
    {
      $lookup: {
        from: 'buildlogs',
        localField: 'name',
        foreignField: 'repository',
        as: 'logs'
      }
    },
    {
      $unwind: {
        path: '$logs',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $project: {
        name: 1,
        registrant: 1,
        owner: 1,
        buildStatus: 1,
        builds: 1,
        logs: {
          metadata: 1,
          buildNumber: 1
        }
      }
    },
    {
      $sort: {
        'logs.buildNumber': -1
      }
    },
    { $limit : 10 }
  ]).exec(function (error, results) {
    callback(error, results);
  });
};

/**
 * Get a single repository with the latest logs
 * @param name: `full_name` of the repository
 * @param callback
 */
module.exports.getRepositoryWithLatestLogs = function (name, callback) {
  Repository.aggregate([
    { $match: {name: name}},
    {
      $lookup: {
        from: 'buildlogs',
        localField: 'name',
        foreignField: 'repository',
        as: 'logs'
      }
    },
    {
      $unwind: {
        path: '$logs',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $sort: {
        'logs.buildNumber': -1
      }
    },
    { $limit : 1 }
  ]).exec(function (error, results) {
    callback(error, results[0]);
  });
};

/**
 * Get build logs of a specified log for a particular repository
 * @param name: `full_name` of the repository
 * @param buildNumber: Build Number of the log
 * @param callback
 */
Repository.getRepositoryWithSpecificLog = function (name, buildNumber, callback) {
  Repository.aggregate([
    {
      $match: {
        name: name
      }
    },
    {
      $lookup: {
        from: 'buildlogs',
        localField: 'name',
        foreignField: 'repository',
        as: 'logs'
      }
    },
    {
      $project: {
        name: 1,
        logs: {
          $filter: {
            input: "$logs",
            as: "log",
            cond: {
              $eq: ["$$log.buildNumber", parseInt(buildNumber)]
            }
          }
        }
      }

    },
    {
      $unwind: {
        path: '$logs',
        preserveNullAndEmptyArrays: true,
      }
    },
  ]).exec(function (error, results) {
    callback(error, results[0]);
  });
};

/**
 * Delete a repository with its log history
 * @param name: `full_name` of the repository
 * @param callback
 */
Repository.deleteRepositoryWithLogs = function (name, callback) {
  Repository.deleteRepositoryByName(name, function (error, repository) {
    if (error) {
      callback(error, repository);
    } else {
      BuildLog.deleteRepositoryLogs(name, callback);
    }
  });
};
