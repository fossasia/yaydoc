var express = require("express");
var router = express.Router();
var request = require("request");
var crypter = require("../util/crypter.js");
var generator = require("../backend/generator.js");
var deploy = require("../backend/deploy.js");
var github = require("../backend/github");
var build = require("../backend/build");

Repository = require("../model/repository.js");
User = require("../model/user");

router.post('/register', function (req, res, next) {
  var repositoryName = req.body.repository || '';
  var organization = req.body.organization.split(":");
  var token = req.user.token || '';

  if (repositoryName === '' || token === '') {
    console.log("Invalid parameters");
    console.log(JSON.stringify({
      "repository_name": repositoryName,
      "token": token
    }));
    return res.redirect('/dashboard?status=registration_failed');
  }

  github.hasAdminAccess(repositoryName, token, function (error, result) {
    if (!result) {
      return res.redirect('/dashboard?status=registration_unauthorized');
    } else {
      request({
        url: `https://api.github.com/repos/${repositoryName}/hooks?access_token=${crypter.decrypt(token)}`,
        headers: {
          'User-Agent': 'request'
        }
      }, function (error, response, body) {
        if (response.statusCode !== 200) {
          console.log(response.statusCode + ': ' + response.statusMessage);
          res.redirect("/dashboard?status=registration_failed");
        }

        var hooks = JSON.parse(body);
        var hookurl = 'https://' + process.env.HOSTNAME + '/ci/webhook';
        var isRegistered = false;
        hooks.forEach(function (hook) {
          if (hook.config.url === hookurl) {
            isRegistered = true
          }
        });

        if (!isRegistered) {
          request({
            url: `https://api.github.com/repos/${repositoryName}/hooks?access_token=${crypter.decrypt(token)}`,
            headers: {
              'User-Agent': 'request'
            },
            method: 'POST',
            json: {
              name: "web",
              active: true,
              events: [
                "push"
              ],
              config: {
                url: hookurl,
                content_type: "json"
              }
            }
          }, function (error, response, body) {

            if (response.statusCode !== 201) {
              console.log(response.statusCode + ': ' + response.statusMessage);
              res.redirect("/dashboard?status=registration_failed");
            }

            Repository.getRepositoryByName(repositoryName, function (error, repository) {
              if (repository === null) {
                repository = {
                  name: repositoryName,
                  owner: {
                    id: organization[0],
                    login: organization[1]
                  },
                  registrant: {
                    id: req.user.id,
                    login: req.user.username
                  },
                  accessToken: token,
                  mailService: {
                    status: true,
                    email: req.user.email,
                  },
                  hook: body.id,
                };
              } else {
                repository = {
                  accessToken: token,
                  registrant: {
                    id: req.user.id,
                    login: req.user.username
                  },
                  hook: body.id,
                };
              }
              Repository.createOrUpdateRepository(repositoryName, repository, function (error) {
                if (error) {
                  res.redirect("/dashboard?status=registration_failed");
                } else {
                  res.redirect("/dashboard?status=registration_successful");
                }
              });
            });
          });
        } else {
          Repository.getRepositoryByName(repositoryName, function (error, repository) {
            if (repository) {
              return res.redirect("/dashboard?status=registration_already");
            }
            return res.redirect("/dashboard?status=registration_mismatch");
          });
        }
      });
    }
  });
});

router.post('/webhook', function(req, res, next) {
  var event = req.get('X-GitHub-Event');
  var branch = req.body.ref.split("/")[2];
  var repositoryName = req.body.repository.full_name;

  if (branch === "gh-pages") {
    return res.json({
      status: false,
      description: "No operation on pushes to gh-pages branch"
    });
  }

  request({
    url: `https://api.github.com/repos/${repositoryName}/contents/.yaydoc.yml?ref=${branch}`,
    headers: {
      'User-Agent': 'request'
    }
  }, function (error, response, body) {
    if (response.statusCode !== 200) {
      return res.json({
        status: false,
        description: ".yaydoc.yml configuration file doesn't exist."
      });
    }

    switch (event) {
      case "push":
        Repository.findOneRepository({
            name: repositoryName
        }).then(function(result) {
          if (result.enable === true) {
            User.getUserById(result.registrant.id, function (error, user) {
              var data = {
                email: user.email,
                gitUrl: req.body.repository.clone_url,
                docTheme: "",
                debug: true,
                targetBranch: branch,
                docPath: ''
              };
              generator.executeScript({}, data, function (err, generatedData) {
                if (err) {
                  build.updateBuildStatus(repositoryName, false);
                  console.log(err);
                  return;
                }
                deploy.deployPages({}, {
                  email: user.email,
                  gitURL: req.body.repository.clone_url,
                  username: result.registrant.login,
                  uniqueId: generatedData.uniqueId,
                  encryptedToken: result.accessToken
                });
                build.updateBuildStatus(repositoryName, true);
              });
            });
          } else {
            res.json({
              status: false,
              description: "Yaydoc is disabled for this repository"
            })
          }
        }).catch((err) => {
          console.log(err);
        });

        return res.json({
          status: true
        });
        break;
      default:
        return res.json({
          status: false,
          description: 'undefined event'
        });
    }
  });
});

module.exports = router;
