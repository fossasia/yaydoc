var exports = module.exports = {};

/**
 * Get the `full_name` of a repository from the URL
 * @param url: Remote URL of the Git Repository
 * @returns string
 */
exports.getRepositoryFullName = function (url) {
  var splitURL = url.split('/');
  return splitURL[3] + '/' + splitURL[4].split('.git')[0];
};

/**
 * Get name of a repository from the URL
 * @param url: Remote URL of the Git Repository
 * @returns string
 */
exports.getRepositoryName = function (url) {
  return url.split('/')[4].split('.git')[0];
};

/**
 * Get name of the owner of a repository from the URL
 * @param url: Remote URL of the Git Repository
 * @returns string
 */
exports.getRepositoryOwner = function (url) {
  return url.split('/')[3];
};
