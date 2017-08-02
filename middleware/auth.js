module.exports.isLoggedIn = function (req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/');
  }
}
