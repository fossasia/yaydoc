var exports = module.exports = {};

/**
 * Middleware to check if the user is logged in or not
 */
exports.isLoggedIn = function (req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/');
  }
};
