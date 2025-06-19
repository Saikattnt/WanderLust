const express = require("express");
const { route } = require("./listings");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

const userController = require("../controllers/user");

router
  .route("/signup")
  .get(userController.renderSignUpForm)
  .post(wrapAsync(userController.signUp));

router
  .route("/login")
  .get(userController.renderLogInForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true, //if authetication fails a flash message will be shown
    }),
    userController.logIN
    //after authentication we come to async part
  );

router.get("/logout", userController.logOut);

//passport.authenticate() act as middleware and used for authentication of the user
module.exports = router;
// User routes can be added here in the future
