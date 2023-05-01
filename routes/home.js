var express = require("express");
var router = express.Router();
var passport = require("../config/passport");
var User = require('../models/user');
var util = require('../util');

// Home
router.get("/", function (req, res) {
  res.render("home");
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
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

// Logout
router.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

// New
router.get('/register', function(req, res){
  var user = req.flash('user')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('register', { user:user, errors:errors });
});

// create
router.post('/register', function(req, res){
  User.create(req.body, function(err, user){
    if(err){
      req.flash('user', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/register');
    }
    res.redirect('/');
  });
});


module.exports = router;