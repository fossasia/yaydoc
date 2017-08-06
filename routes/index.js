var express = require("express");
var router = express.Router();

var authMiddleware = require("../middleware/auth");

var hostname = process.env.HOSTNAME || 'yaydoc.herokuapp.com';

Repository = require("../model/repository");
BuildLog = require("../model/buildlog");

/* GET home page. */
router.get("/", function(req, res, next) {
  var isLoggedIn = false;
  if (req.user) {
    isLoggedIn = true;
  }

  res.render("index", {
    title: "Yaydoc | Automatic Documentation Generation and Deployment",
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
  Repository.getRepositoryWithLatestLogs(req.params.owner + '/' + req.params.reponame, function (error, result) {
    if (!result[0]|| error) {
      return res.status(404).render('repository/404');
    }

    if (result[0].logs === null) {
      return res.status(404).render('repository/404');
    }

    res.render('repository/index', {
      title: result[0].name + ' | Yaydoc',
      repository: result[0],
      hostname: hostname,
    });
  });
});

router.get('/:owner/:reponame/logs', function (req, res, next) {
  Repository.getRepositoryWithLogs(req.params.owner + '/' + req.params.reponame, function (error, result) {
    if (result === null || error) {
      return res.status(404).render('repository/404');
    }

    res.render('repository/logs', {
      title: 'Logs - ' + result[0].name + ' | Yaydoc',
      repository: result[0],
      buildLogs: result,
      hostname: hostname,
    });
  });
});

router.get('/:owner/:reponame/settings', authMiddleware.isLoggedIn, function (req, res, next) {
  Repository.getRepositoryByName(req.params.owner + '/' + req.params.reponame, function (error, repository) {
    if (repository === null || error) {
      return res.status(404).render('repository/404');
    }

    res.render('repository/settings', {
      title: 'Settings - ' + repository.name + ' | Yaydoc',
      repository: repository
    });
  });
});

module.exports = router;
