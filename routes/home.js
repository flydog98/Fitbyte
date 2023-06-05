const express = require("express");
const axios = require('axios').default;
const fetch = require('node-fetch').default;

// 나머지 코드...
const router = express.Router();
const moment = require("moment");
const qs = require("querystring");
const getExercise = require("../service/gymsearch");
const passport = require("../config/passport");
const User = require("../models/user");
const TimePromise = require("../models/userTimePromise");
const SelfPromise = require("../models/userSelfPromise");
const util = require("../util");


//  환경변수 넘겨주기 위함
const dotenv = require('dotenv');
//const { saveAccessToken } = require("../config/db");
const { access } = require("fs");
dotenv.config();

// API 엔드포인트 추가
router.get("/api/config", function (req, res) {
  res.setHeader('Cache-Control', 'no-store'); // 캐시 제어 헤더 설정
  res.json({
    clientId: process.env.FITBIT_CLIENT_ID,
    clientSecret: process.env.FITBIT_CLIENT_SECRET
  });
});

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

  const today = moment().startOf("day");
  var todayTimePromise = await TimePromise.findOne({
    username: req.params.username,
    date: {
      $gte: today.toDate(),
    },
  });

  var timePromises = await TimePromise.find({
    username: req.params.username,
  }).sort({ date: -1 });

  var selfPromises = await SelfPromise.find({
    username: req.params.username,
  }).sort({ date: -1 });

  var exercise = null;
  if (req.query.location != null) {
    exercise = await getExercise(req.query.location);
  }

  return res.render("home", {
    user: req.params.username,
    todayTimePromise: todayTimePromise,
    timePromises: timePromises,
    selfPromises: selfPromises,
    exercise: exercise,
    moment,
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
        return res.redirect(`/${req.user.username}`);
      }
      console.log(data)
      res.redirect(`/${req.user.username}`);
    }
  );
});

// ------ Fitbit OAuth 인증, 데이터 가져오기

// Fitbit 콜백 URL 처리
router.get('/fitbit/callback', (req, res) => {
  // 콜백 url에서 인증코드 추출
  const authorizationCode = req.query.code;
  console.log('콜백 URL에서 인증코드:', authorizationCode); 
  if (authorizationCode) {
    // 인증코드를 사용하여 액세스 토큰 생성
    getAccessToken(authorizationCode)
    .then(accessToken => {
      fetchFitbitActivity(accessToken)
      .then(activityData => {
        console.log('fitbit 데이터 가져오기 성공:', activityData);
        res.redirect('/') // 다시 홈으로 리디렉션
        return activityData;
      })
      .catch(error => {
        console.error('ftbit 데이터 가져오기 오류 발생:', error);
        res.status(500).json({ error: 'Failed to fetch Fitbit activity data' });
      });
    })
  } else {
    res.status(500).json({ error: 'authorizationcode failed' });
  }
});

// 액세스 토큰 생성 함수
function getAccessToken(authorizationCode) {
  // 환경변수 clientId 넘겨주기
  const dotenv = require('dotenv');
  dotenv.config();

  const tokenEndpoint = 'https://api.fitbit.com/oauth2/token';
  const body = new URLSearchParams();
  body.append('clientId', process.env.FITBIT_CLIENT_ID);
  body.append('grant_type', 'authorization_code');
  body.append('code', authorizationCode);
  body.append('redirect_uri', 'http://localhost:8888/fitbit/callback');

  return fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })
    .then(response => response.json())
    .then(data => {
      console.log('액세스 토큰:' , data.access_token);
      //return saveAccessToken(data.access_token)
      return data.access_token;
    // 액세스 토큰 DB 저장할 경우 (사용x)
    //   .then(() => {
    //     console.log('액세스 토큰이 DB에 저장되었습니다.');
    //     return data.access_token;
    //   })
    // .catch(error => {
    //   console.error('액세스 토큰을 DB에 저장하는 동안 오류가 발생했습니다:', error);
    //   throw new Error('Failed to save access token to DB');
    // });
  })
}

// Fitbit 데이터 가져오는 함수
function fetchFitbitActivity(accessToken) {
    // 액세스 토큰 DB 저장할 경우 (사용x)
    // return AccessToken.findOne().exec() // 저장된 액세스 토큰 조회
    // .then(accessTokenDocument => {
    //   const accessToken = accessTokenDocument.token;
    //   console.log('DB에서 불러온 액세스 토큰:', accessToken);

        // --- (어제꺼만 조회)
        const today = new Date();
        const baseUrl = 'https://api.fitbit.com/1/user/-/activities/list.json';
        //const beforeDate = today;
        // --- (한달전까지 조회할 경우 beforeDate='today' 대신에 아래 3줄 사용)
        const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        const beforeDate = formatDate(oneMonthAgo); // 이전 날짜를 요청에 사용하기 위해 형식 맞춤
        const sort = 'desc';
        const limit = 100;
        const queryParams = new URLSearchParams({
          beforeDate,
          sort,
          limit,
          offset: 0
        });
    
        // url에 액세스 토큰 붙이기
        const requestUrl = `${baseUrl}?${queryParams.toString()}`;
        const headers = {
          'Authorization': `Bearer ${accessToken}`
        };
    
        // url요청하여 fitbit 데이터 가져오기
        return fetch(requestUrl, { headers })
          .then(response => response.json())
          .then(data => {
            if (data && data.activities) {
              // 전체 data
              console.log(data);
              // data 중 activity.duration(=활동 시간 데이터) 가져올 것
              return data.activities.map(activity => {
                console.log(activity.duration);
                return activity.duration;
              });
            } else {
              console.log('활동 데이터가 없습니다.');
              return [];
            }
          })
          .catch(error => {
            console.error('Error:', error);
            throw error;
          });
}

// 날짜를 YYYY-MM-DD 형식으로 변환 함수 -> 한달 전 기록까지 볼 때 사용
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


router.patch("/self-promise", async function (req, res) {
  await SelfPromise.updateOne(
    { _id: req.body._id },
    {
      achieved: true,
    },
    function (err) {
      if (err) {
        req.flash("errors", util.parseError(err));
        return res.redirect(`/${req.user.username}`);
      }
      res.redirect(`/${req.user.username}`);
    }
  )
    .clone()
    .catch(function (err) {
      console.log(err);
    });
});

router.delete("/time-promise", async function (req, res) {
  await TimePromise.findOneAndDelete(req.body._id, function (err) {
    if (err) {
      req.flash("errors", util.parseError(err));
      return res.redirect(`/${req.user.username}`);
    }
    res.redirect(`/${req.user.username}`);
  })
    .clone()
    .catch(function (err) {
      console.log(err);
    });
});

router.delete("/self-promise", async function (req, res) {
  await SelfPromise.findOne({_id: req.body._id}).then((doc) => {
    SelfPromise.deleteOne(doc._id, function (err) {
      if (err) {
        req.flash("errors", util.parseError(err));
        return res.redirect(`/${req.user.username}`);
      }
      res.redirect(`/${req.user.username}`);
    });
  });
});

module.exports = router;

