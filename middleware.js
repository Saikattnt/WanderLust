function isLoggedIn(message) {
  return (req, res, next) => {
    // console.log(req.path, "..", req.originalUrl); // path = /new the path user trying to access
    // // req.originalUrl is the complete url we are trying to access
    //req.user trigger isAuthenticated to check whether the user is logged in or not
    if (!req.isAuthenticated()) {
      req.session.redirectUrl = req.originalUrl;
      req.flash("error", message);
      return res.redirect("/login");
    }
    next();
  };
}

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isLoggedIn = isLoggedIn;
