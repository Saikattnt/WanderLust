function isLoggedIn(message) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      const wantsJSON =
        req.xhr ||
        (req.headers.accept &&
          req.headers.accept.toLowerCase().includes("application/json"));

      if (wantsJSON) {
        return res
          .status(401)
          .json({ error: message || "You must be logged in" });
      }

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
