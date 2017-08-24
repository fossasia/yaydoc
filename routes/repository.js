var express = require("express");
var router = express.Router();
var async = require("async");
var github = require("../backend/github");
var authMiddleware = require("../middleware/auth.js");

Repository = require("../model/repository");

router.post('/delete', authMiddleware.isLoggedIn, function (req, res, next) {
  var name = req.body.name || '';

  if (name === '') {
    return res.redirect('/dashboard?status=delete_failure');
  }

  async.waterfall([
    function (callback) {
      Repository.getRepositoryByName(name, function (error, repository) {
        callback(error, repository);
      });
    },
    function (repository, callback) {
      var repositories = [{name: repository.name, hook: repository.hook}];
      repository.subRepositories.forEach(function (x) {
        repositories.push({name:x.name, hook: x.hook});
      });
      async.parallel(repositories.map(function (x) {
        return function(cb) {
          github.deleteHook(x.name, x.hook, req.user.token, function(error){
            cb(error);
          });
        }
      }), function (error) {
        callback(error, repository);
      });
    },
    function (repository, callback) {
      Repository.deleteRepositoryWithLogs(name, function (error) {
        callback(error);
      });
    }
  ], function (error) {
    if (error) {
      return res.redirect('/dashboard?status=delete_failure');
    }
    return res.redirect('/dashboard?status=delete_success');
  });
});


router.post("/disable", authMiddleware.isLoggedIn, function(req, res, next) {
  var query = {
    name: req.body.repository
  };
  Repository.updateRepository(query, {
    enable: false
  })
  .then(function () {
    res.redirect("/dashboard?status=disabled_successful")
  })
  .catch(function () {
    next({
      status: 500,
      messages: 'Something went wrong'
    });
  });
});

router.post("/enable", authMiddleware.isLoggedIn, function(req, res, next) {
  var query = {
    name: req.body.repository
  };
  Repository.updateRepository(query, {
    enable: true
  })
  .then(function () {
    res.redirect("/dashboard?status=enabled_successful")
  })
  .catch(function () {
    next({
      status: 500,
      messages: 'Something went wrong'
    });
  });
});

router.post('/mail/disable', authMiddleware.isLoggedIn, function (req, res, next) {
  Repository.updateRepository({name: req.body.repository}, {'mailService.status': false})
  .then(function () {
    res.json({success: true});
  })
  .catch(function () {
    next({
      status: 500,
      messages: 'Something went wrong'
    });
  });
});

router.post('/mail/enable', authMiddleware.isLoggedIn, function (req, res, next) {
  Repository.updateRepository({name: req.body.repository}, {'mailService.status': true})
  .then(function () {
    res.json({success: true});
  })
  .catch(function () {
    next({
      status: 500,
      messages: 'Something went wrong'
    });
  });
});

router.post('/mail', authMiddleware.isLoggedIn, function (req, res, next) {
  Repository.updateRepository({name: req.body.repository}, {'mailService.email': req.body.email})
  .then(function () {
    res.redirect('/' + req.body.repository + '/settings?status=mail_changed_successful');
  })
  .catch(function () {
    next({
      status: 500,
      messages: 'Something went wrong'
    });
  });
});

router.post('/prstatus/enable', authMiddleware.isLoggedIn, function (req, res, next) {
  Repository.updateRepository({name: req.body.repository}, {PRStatus: true})
  .then(function () {
    res.json({success: true});
    res.redirect('/' + req.body.repository + '/settings?status=pr_enabled_successful');
  })
  .catch(function () {
    next({
      status: 500,
      messages: 'Something went wrong'
    });
  });
});

router.post('/prstatus/disable', authMiddleware.isLoggedIn, function (req, res, next) {
  Repository.updateRepository({name: req.body.repository}, {PRStatus: false})
  .then(function () {
    res.json({success: true});
  })
  .catch(function () {
    next({
      status: 500,
      messages: 'Something went wrong'
    });
  });
});

router.post('/sub/delete', authMiddleware.isLoggedIn, function (req, res, next) {
  var name = req.body.repository;
  var subRepository = req.body.subRepository;
  async.waterfall([
    function (callback) {
      Repository.getSubRepository(name, subRepository, function (error, data) {
        callback(error, data)
      });
    },
    function (repository, callback) {
      github.deleteHook(subRepository, repository.subRepositories[0].hook, req.user.token, function (error) {
        callback(error, repository);
      })
    },
    function (repository, callback) {
      Repository.deleteSubRepository(name, subRepository, function (error, data) {
        callback(error);
      })
    }
  ], function (error) {
    if (error) {
      return res.redirect(`/${name}/settings?status=delete_failure`);
    }
    return res.redirect(`/${name}/settings?status=delete_success`);
  });
});

router.post('/sub/add', authMiddleware.isLoggedIn, function (req, res, next) {
  var name = req.body.mainRepository;
  var subRepository = req.body.repository;
  github.hookValidator(subRepository, req.user.token)
  .then(function (validatedResult) {
    if (validatedResult.isRegistered === true) {
      return res.redirect("/dashboard?status=registration_mismatch");
    }
    github.registerHook({name: subRepository, sub: true}, req.user.token)
    .then(function (registeredHook) {
      if (registeredHook.status !== true) {
        return res.redirect("/dashboard?status=registration_failed");
      }
      Repository.addSubRepository(name, subRepository, registeredHook.body.id, function(error, data) {
        if (error) {
          return next({
            status: 500,
            messages: `Something went wrong`
          });
        }
        res.redirect(`/${name}/settings?status=registration_successful`);
      });
    });
  });
});

router.get('/:owner/:repository/branches', authMiddleware.isLoggedIn, function (req, res, next) {
  var name = req.params.owner + '/' + req.params.repository;
  async.parallel({
    branches: function(callback) {
      github.getRepositoryBranches(name, function (error, branches) {
        callback(error, branches);
      });
    },
    registeredBranches: function (callback) {
      Repository.getRegisteredBranches(name, function (error, registeredBranches) {
        var branches = [];
        for(var branch of registeredBranches) {
          branches.push(branch.name);
        }
        callback(error, branches);
      })
    }
  }, function(error, results) {
    if (error) {
      next({
        status: 500,
        messages: 'Something went wrong'
      });
    }

    res.json({
      branches: results.branches,
      registeredBranches: results.registeredBranches
    })
  });
});

router.post('/branches/delete', authMiddleware.isLoggedIn, function (req, res, next) {
  var branch = req.body.branch;
  var repository= req.body.repository;

  Repository.deleteRepositoryBranch(repository, branch, function (error) {
    if (error) {
      res.redirect('/' + repository + '/settings?status=remove_branch_failed');
    } else {
      res.redirect('/' + repository + '/settings?status=remove_branch_success');
    }
  });
});

router.post('/branches/update', authMiddleware.isLoggedIn, function (req, res, next) {
  var branches = typeof req.body.branches === 'string' ? [req.body.branches] : req.body.branches ;
  var repository = req.body.repository;
  console.log(branches);
  Repository.updateRepositoryBranches(repository, branches, function (error) {
    if (error) {
      res.redirect('/' + repository + '/settings?status=update_branch_failed');
    } else {
      res.redirect('/' + repository + '/settings?status=update_branch_success');
    }
  })
});

module.exports = router;
