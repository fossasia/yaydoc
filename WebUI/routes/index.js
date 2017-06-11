var express = require("express");
var router = express.Router();
var util = require("util");
var spawn = require('child_process').spawn;

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Yaydoc" });
});

router.post("/generate", function (req, res, next) {
  var email = req.body.email;
  var author = req.body.author;
  var gitUrl = req.body.git_url;
  var docTheme = req.body.doc_theme;
  var docPath = req.body.doc_path;
  var projectName = req.body.project_name;
  var version = req.body.version;

  const args = [
    "-g", gitUrl,
    "-a", author,
    "-t", docTheme,
    "-p", docPath,
    "-o", projectName,
    "-v", version,
    "-m", email
  ];
  
  var process = spawn("./generate.sh", args);
  
  process.stdout.on('data', function (data) {
    console.log(data.toString());
  });
  process.stderr.on('data', function (data) {
    console.log(data.toString());
  });
  
  process.on('exit', function (code) {
    console.log('Generation script exited with code ' + code);
    if (code === 0) {
      res.render('success', {
        email: email,
        projectName: projectName
      });
    }
  });
});

router.get('/download/:email/:projectName', function (req, res, next) {
  var file = __dirname + '/../temp/' + req.params.email + '/' + req.params.projectName + '.zip';
  res.download(file);
});

module.exports = router;
