const request = require("request");
const path = require("path");
/*
docChanged: return boolean if any changes happened to specific file format
@params {string} sha - commit sha value
@params {string} username - github username
@params {string} repoName - github repository name
@params {array} format - array of file extensions
@return promise on resolve you get boolean
*/

exports.docChanged = function (sha, username, repoName, formats) {
  return new Promise(function(resolve, reject) {
    request({
      url: `https://api.github.com/repos/${username}/${repoName}/commits/${sha}`,
      headers: {
        'User-Agent': 'request'
      }
    },
    function (err, res, body) {
      if (err) {
        reject(err)
      } else {
        let result = JSON.parse(body);
        let changedFileExtension = result.files.map(function (x) {
          return path.extname(x.filename)
        })
        for (let i = 0; i < changedFileExtension.length; i++) {
          if (formats.indexOf(changedFileExtension[i]) >  -1) {
            resolve(true)
            break
          }
          if (i === changedFileExtension.length - 1) {
            resolve(false)
          }
        }
      }
    })
  })
}
