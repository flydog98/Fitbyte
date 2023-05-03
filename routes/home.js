const express = require("express");
const router = express.Router();
const moment = require('moment');
const passport = require("../config/passport");
const User = require("../models/user");
const TimePromise = require("../models/userTimePromise");
const SelfPromise = require("../models/userSelfPromise");
const util = require("../util");

// Home
router.get("/", util.isLoggedin, function (req, res) {
  return res.redirect(`/${req.user.username}`);
});

// Login
router.get("/login", function (req, res) {
  var username = req.flash("username")[0];
  var errors = req.flash("errors")[0] || {};
  res.render("login", {
    username: username,
    errors: errors,
  });
});

// New
router.get("/register", function (req, res) {
  var user = req.flash("user")[0] || {};
  var errors = req.flash("errors")[0] || {};
  res.render("register", { user: user, errors: errors });
});

router.get("/:username", util.isLoggedin, async function (req, res) {
  // user 없을 때 방어 로직

  const today = moment().startOf('day');
  var todayTimePromise = await TimePromise.findOne({
    username: req.params.username,
    date: {
      $gte: today.toDate()
    }
  });

  var selfPromises = await SelfPromise.find({
    username: req.params.username
  })

  return res.render("home", {
    user: req.params.username,
    todayTimePromise: todayTimePromise,
    selfPromises: selfPromises
  });
});

// Logout
router.post("/logout", function (req, res) {
  req.logout();
  req.session.save(function () {
    res.redirect("/");
  });
});

// Post Login
router.post(
  "/login",
  function (req, res, next) {
    var errors = {};
    var isValid = true;

    if (!req.body.username) {
      isValid = false;
      errors.username = "Username is required!";
    }
    if (!req.body.password) {
      isValid = false;
      errors.password = "Password is required!";
    }

    if (isValid) {
      next();
    } else {
      req.flash("errors", errors);
      res.redirect("/login");
    }
  },

  passport.authenticate("local-login", {
    // successRedirect: "/",
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

// register user
router.post("/register", function (req, res) {
  User.create(req.body, function (err, user) {
    if (err) {
      req.flash("user", req.body);
      req.flash("errors", util.parseError(err));
      return res.redirect("/register");
    }
    res.redirect("/login");
  });
});

router.post("/time-promise", async function (req, res) {
  await TimePromise.create(
    {
      username: req.user.username,
      amount: req.body.amount,
    },
    function (err) {
      if (err) {
        req.flash("errors", util.parseError(err));
        return res.redirect(`/${req.body.username}`);
      }
      res.redirect(`/${req.user.username}`);
    }
  );
});

router.post("/self-promise", async function (req, res) {
  await SelfPromise.create(
    {
      username: req.user.username,
      date: req.body.date,
      amount: req.body.amount,
      contents: req.body.contents,
    },
    function (err) {
      if (err) {
        req.flash("errors", util.parseError(err));
        return res.redirect(`/${req.body.username}`);
      }
      res.redirect(`/${req.user.username}`);
    }
  );
});

module.exports = router;
