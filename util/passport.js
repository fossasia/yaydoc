var githubStrategy = require("passport-github").Strategy;
var herokuStrategy = require("passport-heroku").Strategy;

module.exports = function (passport) {
  passport.serializeUser(function(user, cb) {
    cb(null, user);
  });

  passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
  });

  passport.use(new githubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  }, function (accessToken, refreshToken, profile, cb) {
    profile.token = accessToken;
    cb(null, profile)
  }));

  passport.use(new herokuStrategy({
      clientID: process.env.HEROKU_CLIENT_ID,
      clientSecret: process.env.HEROKU_CLIENT_SECRET,
      callbackURL: process.env.HEROKU_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, cb) {
      profile.token = accessToken;
      cb(null, profile);
    }
  ));

};
