var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var FitbitStrategy = require("passport-fitbit-oauth2").FitbitOAuth2Strategy; // npm install passport-fitbit-oauth2 설치 필요

// 환경변수 로드 (클라이언트정보가 시크릿이기에)
require('dotenv').config(); // npm install dotenv 명령으로 라이브러리 설치 필요
const clientId = process.env.FITBIT_CLIENT_ID;
const clientSecret = process.env.FITBIT_CLIENT_SECRET;

// serialize & deserialize User
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findOne({_id:id}, function(err, user) {
    done(err, user);
  });
});

// local strategy
passport.use('local-login',
  new LocalStrategy({
      usernameField : 'username',
      passwordField : 'password',
      passReqToCallback : true
    },
    function(req, username, password, done) {
      User.findOne({username:username})
        .select({password:1})
        .exec(function(err, user) {
          if (err) return done(err);

          if (user && user.authenticate(password)){
            return done(null, user);
          }
          else {
            req.flash('username', username);
            req.flash('errors', {login:'The username or password is incorrect.'});
            return done(null, false);
          }
        });
    }
  )
);


// Fitbit strategy
passport.use(
  new FitbitStrategy(
    {
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: "http://localhost:8888/fitbit/callback",
      scope: ["activity", "location"], // 필요한 스코프 설정
    },
    function (accessToken, refreshToken, profile, done) {
      // 사용자 정보 저장 또는 기타 필요한 처리
      done(null, profile);
    }
  )
);

module.exports = passport;
