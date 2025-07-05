const User = require("../models/user");

module.exports.renderSignUpForm = (req, res) => {
  res.render("users/signup"); // Render the signup page
};

module.exports.signUp = async (req, res) => {
  try {
    let { username, email, password } = req.body; //Extracts username, email, and password from the form.
    const newUser = new User({ email, username });
    const registerdUser = await User.register(newUser, password);
    req.login(registerdUser, (err) => {
      if (err) {
        return next(err);
      }
      if (req.user && req.user.cart) {
        req.session.cart = req.user.cart;
      }
      req.flash("success", "Welcome to your dreamestination");
      res.redirect("/listings");
    });
  } catch (e) {
    console.error("Error during user registration:", e.message);
    req.flash("error", "Username is already registered. Please try again.");
    res.redirect("/signup");
  }
};

module.exports.renderLogInForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.logIN = async (req, res) => {
  if (req.user && req.user.cart) {
    req.session.cart = req.user.cart;
  }
  req.flash("success", "Welcome to Wanderlust!Ready for a trip again!");
  res.redirect("/listings"); // Redirect to requested url after successful login
};

module.exports.logOut = (req, res, next) => {
  //Calls req.logout() to end the session.
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/login");
  });
};
