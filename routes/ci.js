var express = require("express");
var router = express.Router();

var generator = require("../backend/generator.js");
var deploy = require("../backend/deploy.js");
var github = require("../backend/github");
var build = require("../backend/build");
var authMiddleware = require("../middleware/auth");

Repository = require("../model/repository.js");
User = require("../model/user");
BuildLog = require("../model/buildlog");

router.post('/register', authMiddleware.isLoggedIn, function (req, res, next) {
  var repositoryName = req.body.repository || '';
  var organization = req.body.organization.split(":");
  var token = req.user.token || '';
  var subRepositories = req.body.subRepositories !== undefined ? req.body.subRepositories : [];
  subRepositories = typeof subRepositories === 'string' ? [subRepositories] : subRepositories;
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
      var hookValidation = Promise.all([repositoryName].concat(subRepositories).map(x => github.hookValidator(x, token)))
      hookValidation.then(function (validatedResults) {
        var registeredRepository = '';
        for (var i = 0; i < validatedResults.length; i++) {
          if (validatedResults[i].isRegistered === true) {
            registeredRepository = validatedResults[i].repository;
            break;
          }
        }
        if (registeredRepository !== '') {
          Repository.getRepositoryByName(repositoryName, function (error, repository) {
            if (repository) {
              return res.redirect("/dashboard?status=registration_already");
            }
            return res.redirect("/dashboard?status=registration_mismatch");
          });
        } else {
          var registeredHook = Promise.all([{name:repositoryName,sub:false}]
          .concat(subRepositories.map(x => ({name:x, sub: true})))
          .map(x => github.registerHook(x, token)));
          registeredHook.then(function (registeredHookResults) {
            var flag = false; //if hook registring failed flag turns flase
            for (var i = 0; i < registeredHookResults.length; i++) {
              if (registeredHookResults[i].status === false) {
                flag = true;
                break;
              }
            }
            if (flag) {
              res.redirect("/dashboard?status=registration_failed");
            } else {
              Repository.getRepositoryByName(repositoryName, function (error, repository) {
                var hookResultBody = [];
                registeredHookResults.forEach(function (x) {
                  hookResultBody.push(x.body)
                });
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
                    hook: hookResultBody.map(x => x.id),
                    subRepositories: subRepositories
                  };
                } else {
                  repository = {
                    accessToken: token,
                    registrant: {
                      id: req.user.id,
                      login: req.user.username
                    },
                    hook: hookResultBody.map(x => x.id),
                    subRepositories: subRepositories
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
              }
           })
           .catch(function () {
             res.redirect("/dashboard?status=registration_failed");
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
  var query = {};
  if (req.query.sub === "true") {
    query.subRepositories = req.body.repository.full_name;
  } else {
    query.name = req.body.repository.full_name;
  }
  Repository.findOneRepository(query)
  .then(function (repositoryData) {
    if (repositoryData.enable === true) {
      github.checkYaydocConfigurationInRepository(repositoryName, branch, function (error, response, body) {
        if (response.statusCode !== 200) {
          res.json({
            status: false,
            description: ".yaydoc.yml configuration file doesn't exist."
          });
        } else {
          switch (event) {
            case 'push':
            User.getUserById(repositoryData.registrant.id, function(err, userData) {
              if (err) {
                next({
                  status: 500,
                  message: 'Something went wrong.'
                });
              } else {
                BuildLog.constructBuildLog({
                  repository: repositoryName,
                  compareCommits: req.body.compare,
                  headCommit: req.body.head_commit,
                  ref: req.body.ref
                }, function (error) {
                  if (error) {
                    build.updateBuildStatus(repositoryData.name, repositoryData.builds, false);
                    console.log(err);
                    return;
                  }

                  var data = {
                    email: userData.email,
                    gitUrl: `https://github.com/${repositoryData.name}.git`,
                    docTheme: '',
                    debug: true,
                    targetBranch: branch,
                    docPath: '',
                    subProject: repositoryData.subRepositories.map(x => `https://github.com/${x}.git`)
                  };
                  generator.executeScript({}, data, function (err, generatedData) {
                    if (err) {
                      build.updateBuildStatus(repositoryData.name, repositoryData.builds, false);
                      console.log(err);
                      return;
                    } else {
                      deploy.deployPages({}, {
                        email: userData.email,
                        gitURL: `https://github.com/${repositoryData.name}.git`,
                        username: repositoryData.registrant.id,
                        uniqueId: generatedData.uniqueId,
                        encryptedToken: repositoryData.accessToken
                      });
                      build.updateBuildStatus(repositoryData.name, repositoryData.builds, true);
                    }
                  });
                });
              }
            });
              break;
            default:
            return res.json({
              status: false,
              description: 'undefined event'
            });
          }
        }
      });
    } else {
      res.json({
        status: false,
        description: "Yaydoc disabled for this repository"
      });
    }
  }).catch(function (err) {
      console.log(err);
  });
});

module.exports = router;
