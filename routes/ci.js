var express = require("express");
var router = express.Router();
var request = require("request");
var repositoryModel = require("../model/repository.js");
var crypter = require("../util/crypter.js");
var generator = require("../backend/generator.js");
var deploy = require("../backend/deploy.js");

router.get('/register', function (req, res, next) {
  var query = `ci=true&username=${req.session.username}`;
  res.redirect(`/?${query}`);
});

router.post('/register', function (req, res, next) {
  var repositoryName = req.body.repository || '';
  var token = req.session.token || '';

  if (repositoryName === '' || token === '') {
    console.log("Invalid parameters");
    console.log(JSON.stringify({
      "repository_name": repositoryName,
      "token": token
    }));
    return res.redirect('/?message=3');
  }

  request({
    url: `https://api.github.com/repos/${repositoryName}/hooks?access_token=${token}`,
    headers: {
      'User-Agent': 'request'
    }
  }, function (error, response, body) {
    if (response.statusCode !== 200) {
      console.log(response.statusCode + ': ' + response.statusMessage);
      res.redirect("/?message=3");
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
        url: `https://api.github.com/repos/${repositoryName}/hooks?access_token=${token}`,
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
      }, function(error, response, body) {

        if (response.statusCode !== 201) {
          console.log(response.statusCode + ': ' + response.statusMessage);
          res.redirect("/?message=3");
        }

        repositoryModel.newRepository(repositoryName,
          req.session.username,
          req.session.githubId,
          crypter.encrypt(token),
          req.session.email)
          .then(function(result) {
            res.redirect("/?message=1");
          })
          .catch(function(err) {
            next({
              status: 500,
              message: 'Something went wrong.'
            })
          })
      })
    } else {
      res.redirect("/?message=2");
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
        repositoryModel.findOneRepository({
            name: req.body.repository.full_name
        }).then(function(result) {
          var data = {
            email: result.email,
            gitUrl: req.body.repository.clone_url,
            docTheme: "",
            debug: true,
            targetBranch: branch,
            docPath: ''
          };
          generator.executeScript({}, data, function(err, generatedData) {
            if (err) {
              console.log(err);
              return;
            }
            deploy.deployPages({}, {
              email: result.email,
              gitURL: req.body.repository.clone_url,
              username: result.username,
              uniqueId: generatedData.uniqueId,
              encryptedToken: result.accessToken
            });
          });
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
