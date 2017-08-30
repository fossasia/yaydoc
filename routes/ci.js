var express = require("express");
var router = express.Router();

var generator = require("../backend/generator.js");
var deploy = require("../backend/deploy.js");
var github = require("../backend/github");
var build = require("../backend/build");
var authMiddleware = require("../middleware/auth");
var async = require("async");

Repository = require("../model/repository.js");
User = require("../model/user");
BuildLog = require("../model/buildlog");
StatusLog = require("../model/statuslog");

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
                  hookResultBody.push(x.body);
                });
                var mainRepoHook = hookResultBody.splice(0,1);
                var aggregatedSubRepositories= [];
                for (var i = 0; i < subRepositories.length; i++) {
                  aggregatedSubRepositories.push({name: subRepositories[i], hook: hookResultBody[i].id})
                }
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
                    hook: mainRepoHook[0].id,
                    subRepositories: aggregatedSubRepositories
                  };
                } else {
                  repository = {
                    accessToken: token,
                    registrant: {
                      id: req.user.id,
                      login: req.user.username
                    },
                    hook: mainRepoHook[0].id,
                    subRepositories: aggregatedSubRepositories
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
  var branch;
  var repositoryName = req.body.repository.full_name;
  var query = {};
  if (event === "pull_request") {
    branch = req.body.pull_request.base.ref;
  } else {
    branch = req.body.ref.split("/")[2];
  }
  if (req.query.sub === "true") {
    query['subRepositories.name'] = req.body.repository.full_name;
  } else {
    query.name = req.body.repository.full_name;
  }
  Repository.findOneRepository(query)
  .then(function (repositoryData) {
    if (repositoryData.enable === true) {
      github.checkYaydocConfigurationInRepository(repositoryData.name, branch, function (error, response, body) {
        if (response.statusCode !== 200) {
          res.json({
            status: false,
            description: ".yaydoc.yml configuration file doesn't exist."
          });
        } else {
          switch (event) {
            case 'push':
            if (branch === "gh-pages") {
              return res.json({
                status: false,
                description: "No operation on pushes to gh-pages branch"
              });
            }

            if (repositoryData.branches.length !== 0) {
              var result = repositoryData.branches.find(function (element) {
                if (element.name === branch) {
                  return true;
                }
                return false;
              });

              if (!result) {
                return res.json({
                  status: false,
                  description: "No operation on pushes to branch: " + branch
                });
              }
            }

            User.getUserById(repositoryData.registrant.id, function(err, userData) {
              if (err) {
                next({
                  status: 500,
                  message: 'Something went wrong.'
                });
              } else {
                BuildLog.constructBuildLog({
                  repository: repositoryData.name,
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
                    subProject: repositoryData.subRepositories.map(x => `https://github.com/${x.name}.git`),
                    ci: true
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
            case 'pull_request':
              if (req.body.action === "reopened" || req.body.action === "opened") {
                if (repositoryData.PRStatus === true) {
                  var commitId = req.body.pull_request.head.sha;
                  var targetURL = `http://${process.env.HOSTNAME}/`;
                  var name = `${req.body.pull_request.head.label.split(":")[0]}/${req.body.repository.full_name.split("/")[1]}`;
                  github.createStatus(commitId, req.body.repository.full_name, "pending", "Yaydoc is checking your build", targetURL, repositoryData.accessToken, function(error, data) {
                    if (!error) {
                      var user = req.body.pull_request.head.label.split(":")[0];
                      var targetBranch = req.body.pull_request.head.label.split(":")[1];
                      var gitURL = `https://github.com/${user}/${req.body.repository.name}.git`;
                      var data = {
                        email: "admin@fossasia.org",
                        gitUrl: gitURL,
                        docTheme: "",
                        debug: true,
                        docPath: "",
                        buildStatus: true,
                        targetBranch: targetBranch
                      };
                      generator.executeScript({}, data, function(error, generatedData) {
                        var status, description, buildStatus, uniqueId;
                        if(error) {
                          buildStatus = false;
                          status = "failure";
                          description = error.message;
                          uniqueId = error.uniqueId;
                        } else {
                          buildStatus = true
                          status = "success";
                          description = generatedData.message;
                          uniqueId = generatedData.uniqueId;
                        }
                        var names = [req.body.repository.owner.login, req.body.sender.login];
                        async.parallel(names.map(function (x) {
                          return function (cb) {
                            github.getUserDetail(x, function(error, data) {
                              cb(error, data);
                            })
                          }
                        }), function (error, data) {
                          if (error === null) {
                            for (var i = 0; i < data.length; i++) {
                              if (data[i].name !== undefined) {
                                names[i] = data[i].name;
                              }
                            }
                          }
                          var metadata = {
                            status: buildStatus,
                            compareCommits: req.body.pull_request.html_url + '/files',
                            compareCommitsSha: req.body.pull_request.base.sha,
                            ref: req.body.pull_request.head.ref,
                            headCommit: {
                              message: req.body.pull_request.title,
                              url: req.body.pull_request.html_url,
                              author: {
                                name: names[0]
                              },
                              committer: {
                                name: names[1]
                              },
                              sha: req.body.pull_request.head.sha
                            },
                            number: req.body.number
                          };
                          StatusLog.storeLog(name, repositoryName, metadata,  `temp/admin@fossasia.org/generate_${uniqueId}.txt`, function(error, data) {
                            if (error) {
                              status = "failure";
                            } else {
                              targetBranch = `https://${process.env.HOSTNAME}/prstatus/${data._id}`
                            }
                            github.createStatus(commitId, req.body.repository.full_name, status, description, targetBranch, repositoryData.accessToken, function(error, data) {
                              if (error) {
                                console.log(error);
                              } else {
                                console.log(data);
                              }
                            });
                          });
                        });
                      });
                    }
                  });
                } else {
                  res.json({
                    status: true,
                    description: "PR Status check is disabled for this repository"
                  });
                }
              }
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
