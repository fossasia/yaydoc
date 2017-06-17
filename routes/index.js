var express = require("express");
var router = express.Router();
var passport = require("passport")
var crypter = require("../util/crypter.js")
/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Yaydoc" });
});

/* Downloading Documentation as ZIP */
router.get('/download/:email/:uniqueId', function (req, res, next) {
  var file = __dirname + '/../temp/' + req.params.email + '/' + req.params.uniqueId + '.zip';
  res.download(file);
});

router.get("/github", function (req, res, next) {
  req.session.uniqueId = req.query.uniqueId;
  req.session.email = req.query.email
  req.session.gitURL = req.query.gitURL
  next()
}, passport.authenticate('github', {
  scope: [
    'public_repo',
    'read:org'
  ]
}))

router.get("/callback", passport.authenticate('github'), function (req, res, next) {
  req.session.username = req.user.username;
  req.session.token = req.user.token
  res.redirect("/deploy")
})

router.get("/deploy", function (req, res, next) {
  res.render("deploy", {
    email: req.session.email,
    gitURL: req.session.gitURL,
    uniqueId: req.session.uniqueId,
    token: crypter.encrypt(req.session.token),
    username: req.session.username
  })
})

module.exports = router;
