const serverless = require("serverless-http");
const express = require("express");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const exerciseCheckCron = require("./service/cron")
const passport = require("./config/passport");
const util = require("./util");
const morgan = require("morgan");
const app = express();

// Other settings
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(flash());
app.use(session({ secret: "MySecret", resave: true, saveUninitialized: true }));
app.use(morgan("dev"));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Custom Middlewares
app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.util = util;
  next();
});

// Routes
app.use("/", require("./routes/home"));

connectDB();
exerciseCheckCron();

// Port setting
// var port = 8888;
// app.listen(port, function () {
//   console.log("server on! http://localhost:" + port);
// });

module.exports.handler = serverless(app);