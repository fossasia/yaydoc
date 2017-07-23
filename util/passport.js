const GithubStrategy = require("passport-github").Strategy;
const HerokuStrategy = require("passport-heroku").Strategy;

const User = require('../model/user');

module.exports = function (passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function (error, user) {
      done(error, user);
    });
  });

  passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  }, function (accessToken, refreshToken, profile, done) {
    User.getUserById(profile.id, function (error, user) {
      if (error) {
        return done(error);
      }
      if (user) {

        return done(null, user);
      } else {
        let newUser = new User();
        newUser.id = profile.id;
        newUser.token = accessToken;
        newUser.name = profile.displayName;
        newUser.email = profile.emails[0].value;
        newUser.username = profile.username;

        newUser.save(function (error) {
          if (error) {
            throw error;
          }
          return done(null, newUser);
        })
      }
    });
  }));

  passport.use(new HerokuStrategy({
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
