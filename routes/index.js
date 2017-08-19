var express = require("express");
var router = express.Router();

var authMiddleware = require("../middleware/auth");

var hostname = process.env.HOSTNAME || 'yaydoc.herokuapp.com';
var github = require("../backend/github");

Repository = require("../model/repository");
BuildLog = require("../model/buildlog");
StatusLog = require("../model/statuslog");

router.get('/prstatus/:buildId', function (req, res, next) {
  var buildId = req.params.buildId;
  StatusLog.getLog(buildId, function (error, data) {
    if (error) {
      return next({
        status: 500,
        message: 'Something went wrong.'
      });
    }
    if (data === null) {
      return res.render('404');
    }
    var repository = {
      name: data.repository,
      logs: data
    };
    res.render('repository/index', {
      title: 'Logs - ' + repository.name,
      repository: repository,
      hostname: hostname,
      loggedIn: !!req.user,
      PRStatus: true,
      specificLog: false
    });
  });
});

/* GET home page. */
router.get("/", function(req, res, next) {
  var isLoggedIn = false;
  if (req.user) {
    isLoggedIn = true;
  }

  res.render("index", {
    isLoggedIn: isLoggedIn,
  });
});

/* Downloading Documentation as ZIP */
router.get('/download/:email/:uniqueId', function (req, res, next) {
  var file = __dirname + '/../temp/' + req.params.email + '/' + req.params.uniqueId + '.zip';
  res.download(file);
});

/* Download detailed logs created during documentation generation */
router.get('/logs/:type/:email/:uniqueId', function (req, res, next) {
  var file = __dirname + '/../temp/' + req.params.email + '/' + req.params.type + '_' + req.params.uniqueId + '.txt';
  res.download(file);
});

/* Generate SVG image for build status of repository */
router.get('/:owner/:reponame.svg', function (req, res, next) {
  Repository.getBuildStatusByRepositoryName(req.params.owner + '/' + req.params.reponame, function (error, result) {
    var buildStatus = 'invalid';
    var width = '94';
    var color = '#9f9f9f';
    var x = '70.5';
    if (result === null || error) {
      res.status(404);
    } else {
      if (result.buildStatus) {
        buildStatus = 'success';
        width = '102';
        color = '#97CA00';
        x = '74.5';
      } else {
        buildStatus = 'failed';
        width = '88';
        color = '#E05d44';
        x = '67.5'
      }
    }

    res.set('Content-Type', 'image/svg+xml');
    res.render("badge", {
      status: buildStatus,
      width: width,
      color: color,
      x: x,
    });
  });
});

router.get('/:owner/:reponame', function (req, res, next) {
  var fullName = req.params.owner + '/' + req.params.reponame;
  Repository.getRepositoryWithLatestLogs(fullName, function (error, result) {
    if (!result|| error) {
      return res.status(404).render('repository/404', {
        name: fullName,
        loggedIn: !!req.user,
      });
    }

    if (!result.logs) {
      return res.render('repository/204', {
        name: fullName,
        loggedIn: !!req.user,
      });
    }

    res.render('repository/index', {
      title: result.name,
      repository: result,
      hostname: hostname,
      loggedIn: !!req.user,
    });
  });
});

router.get('/:owner/:reponame/logs', function (req, res, next) {
  var fullName = req.params.owner + '/' + req.params.reponame;
  Repository.getRepositoryWithLogs(fullName, function (error, result) {
    if (result.length === 0 || error) {
      return res.status(404).render('repository/404', {
        name: fullName,
        loggedIn: !!req.user,
      });
    }

    if (result.length === 1 && !result[0].logs) {
      return res.render('repository/204', {
        name: fullName,
        loggedIn: !!req.user,
      });
    }

    res.render('repository/logs', {
      title: 'Logs - ' + result[0].name,
      repository: result[0],
      buildLogs: result,
      hostname: hostname,
      loggedIn: !!req.user,
    });
  });
});

router.get('/:owner/:reponame/logs/:buildNumber', function (req, res, next) {
  var fullName = req.params.owner + '/' + req.params.reponame;
  Repository.getRepositoryWithSpecificLog(fullName, req.params.buildNumber, function (error, result) {
    if (!result|| error) {
      return res.status(404).render('repository/404', {
        name: fullName
      });
    }

    if (!result.logs) {
      return res.render('repository/204', {
        name: fullName
      });
    }

    res.render('repository/index', {
      title: '#' + result.logs.buildNumber + ' - ' + result.name,
      repository: result,
      hostname: hostname,
      specificLog: true,
      loggedIn: !!req.user,
    });
  });
});

router.get('/:owner/:reponame/settings', authMiddleware.isLoggedIn, function (req, res, next) {
  var fullName = req.params.owner + '/' + req.params.reponame;
  Repository.getRepositoryByName(fullName, function (error, repository) {
    if (repository === null || error) {
      return res.status(404).render('repository/404', {
        name: fullName,
        loggedIn: true,
      });
    }

    github.retrieveOrganizations(req.user.token, function(error, organizations) {
      if (error) {
        return next({
          status: 500,
          messages: `Something went wrong`
        });
      }
      res.render('repository/settings', {
        title: 'Settings - ' + repository.name,
        repository: repository,
        loggedIn: true,
        user: req.user,
        organizations: organizations
      });
    });
  });
});

module.exports = router;
