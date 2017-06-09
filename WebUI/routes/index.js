var express = require("express");
var router = express.Router();
var util = require("util");
var exec = require("child_process").exec;


/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Yaydoc" });
});

router.post("/generate", function (req, res, next) {
  var author = req.body.author;
  var gitUrl = req.body.git_url;
  var docTheme = req.body.doc_theme;
  var docPath = req.body.doc_path;
  var projectName = req.body.project_name;
  var version = req.body.version;

  exec("./generate.sh -g " + gitUrl + " -a " + author + " -t " + docTheme + " -p " + docPath + " -o " + projectName
      + " -v " + version, function (error, stdout, stderr) {
      //
  }).on("exit", function (code) {
      if (code === 0) {
        res.render("success");
      }
  });
});

module.exports = router;
