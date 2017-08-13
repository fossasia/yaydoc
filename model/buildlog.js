const mongoose = require('mongoose');
const fs = require("fs");


Repository = require('./repository');

const buildLogSchema = mongoose.Schema({
  repository: String,
  buildNumber: {
    type: Number,
    default: 0,
  },
  metadata: {
    status: {
      type: Boolean,
      default: false,
    },
    compareCommits: String,
    headCommit: Object,
    ref: String,
  },
  generate: {
    data: Buffer,
    datetime: Date,
  },
  ghpages: {
    data: Buffer,
    datetime: Date,
  },
});

const BuildLog = module.exports = mongoose.model('BuildLog', buildLogSchema);


module.exports.constructBuildLog = function (data, callback) {
  Repository.incrementBuildNumber(data.repository, function (error, repository) {
    var buildlog = new BuildLog({
      repository: data.repository,
      buildNumber: repository.builds,
      metadata: {
        compareCommits: data.compareCommits,
        headCommit: data.headCommit,
        ref: data.ref
      }
    });
    buildlog.save(function (error, repository) {
      callback(error, repository);
    })
  });
};

/**
 * Get a single build log by id
 * @param id: ObjectId of the build log
 * @param callback
 */
module.exports.getBuildLogById = function(id, callback) {
  BuildLog.findOne({_id: id}, callback);
};

/**
 * Get a list of build logs for a given repository
 * @param repository: `full_name` of the repository
 * @param callback
 */
module.exports.getBuildLogsByRepository = function(repository, callback) {
  BuildLog.find({repository: repository}).limit(10).sort([['buildNumber', 'descending']]).exec(callback);
};

/**
 * Get a specific build log by buildNumber for a given repository
 * @param repository: `full_name` of the repository
 * @param buildNumber: Build Number
 * @param callback
 */
module.exports.getParticularBuildLog = function (repository, buildNumber, callback) {
  BuildLog.findOne({
    repository: repository,
    buildNumber: buildNumber,
  }, callback);
};

/**
 * Get the latest build log of a given repository
 * @param repository: `full_name` of the repository
 * @param callback
 */
module.exports.getLatestBuildLogByRepository = function (repository, callback) {
  BuildLog.findOne({repository:repository}).sort([['buildNumber', 'descending']]).exec(callback);
};

/**
 * Store logs created while generating docs for a given repository
 * @param name: `full_name` of the repository
 * @param filepath: file path of the generate logs
 * @param callback
 */
module.exports.storeGenerateLogs = function (name, filepath, callback) {
  Repository.getRepositoryByName(name, function (error, repository) {
    if (error) {
      callback(error);
    } else {
      BuildLog.getParticularBuildLog(repository.name, repository.builds, function (error, buildLog) {
        buildLog.generate.data = fs.readFileSync(filepath);
        buildLog.generate.datetime = new Date();
        buildLog.save(function (error, buildLog) {
          callback(error, buildLog);
        })
      });
    }
  });
};

/**
 * Store logs created while deploying logs for a given repository
 * @param name: `full_name` of the repository
 * @param filepath: file of the ghpages deploy logs
 * @param callback
 */
module.exports.storeGithubPagesLogs = function (name, filepath, callback) {
  Repository.getRepositoryByName(name, function (error, repository) {
    if (error) {
      callback(error);
    } else {
      BuildLog.getParticularBuildLog(repository.name, repository.builds, function (error, buildLog) {
        buildLog.ghpages.data = fs.readFileSync(filepath);
        buildLog.ghpages.datetime = new Date();
        buildLog.save(function (error, buildLog) {
          callback(error, buildLog);
        })
      });
    }
  })
};

/**
 * Delete all the logs of a given repository
 * @param name: `full_name` of the repository
 * @param callback
 */
module.exports.deleteRepositoryLogs = function (name, callback) {
  BuildLog.deleteMany({repository: name}, callback);
};

module.exports.setBuildStatus = function (name, buildNumber, buildStatus, callback) {
  BuildLog.findOneAndUpdate({
    repository: name,
    buildNumber: buildNumber,
  }, {
    'metadata.status': buildStatus
  }, callback);
};
