const mongoose = require('mongoose');
const fs = require('fs');

const statusLogScheme = mongoose.Schema({
  repository: String,
  generate: {
    data: Buffer,
    datetime: Date
  },
  parentRepository: String,
  metadata: {
    status: {
      type: Boolean,
      default: false
    },
    compareCommits: String,
    headCommit: Object,
    ref: String,
    compareCommitsSha: String,
    number: Number
  }
});

const StatusLog = module.exports = mongoose.model('StatusLog', statusLogScheme);
/**
 * Store the PR status log
 * @param repository: `full_name` of the repository
 * @param parentRepository: `full_name` of the parent repository
 * @param filepath: Path of the log file
 * @param callback: callback
 */
module.exports.storeLog = function (repository, parentRepository, metadata, filepath, callback) {
  var statusLog = new StatusLog({
    repository: repository,
    generate: {
      data: fs.readFileSync(filepath),
      datetime: new Date()
    },
    parentRepository: parentRepository,
    metadata: metadata
  });
  statusLog.save(callback);
}

/**
 * Get log by id
 * @param id: `_id` of the document
 * @param callback: callback
 */
module.exports.getLog = function (id, callback) {
  StatusLog.findOne({
    _id: id
  }, callback);
}
