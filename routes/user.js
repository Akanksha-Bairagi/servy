const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const users = require("../controllers/users");

router.route("/signup")
  .get(users.renderSignup)
  .post(wrapAsync(users.signup));

router.route("/login")
  .get(users.renderLogin)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    users.login
  );

router.get("/logout", users.logout);

module.exports = router;
