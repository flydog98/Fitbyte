const express = require("express");
const router = express.Router();
const moment = require("moment");
const passport = require("../config/passport");
const User = require("../models/user");
const TimePromise = require("../models/userTimePromise");
const SelfPromise = require("../models/userSelfPromise");
const util = require("../util");
const AWS = require("aws-sdk");
const fs = require("fs");

function searchGym(locationName) {
  let x, y;

  if (locationname == "강남구") {
    x = 127.0495556;
    y = 37.514575;
  } else if (locationname == "강동구") {
    x = 127.1258639;
    y = 37.52736667;
  } else if (locationname == "강북구") {
    x = 127.0277194;
    y = 37.63695556;
  } else if (locationname == "강서구") {
    x = 126.851675;
    y = 37.54815556;
  } else if (locationname == "관악구") {
    x = 126.9538444;
    y = 37.47538611;
  } else if (locationname == "광진구") {
    x = 127.0845333;
    y = 37.53573889;
  } else if (locationname == "구로구") {
    x = 126.8895972;
    y = 37.49265;
  } else if (locationname == "금천구") {
    x = 126.9041972;
    y = 37.44910833;
  } else if (locationname == "노원구") {
    x = 127.0583889;
    y = 37.65146111;
  } else if (locationname == "도봉구") {
    x = 127.0495222;
    y = 37.66583333;
  } else if (locationname == "동대문구") {
    x = 127.0421417;
    y = 37.571625;
  } else if (locationname == "동작구") {
    x = 126.941575;
    y = 37.50965556;
  } else if (locationname == "마포구") {
    x = 126.9105306;
    y = 37.56070556;
  } else if (locationname == "서대문구") {
    x = 126.9388972;
    y = 37.57636667;
  } else if (locationname == "서초구") {
    x = 127.0348111;
    y = 37.48078611;
  } else if (locationname == "성동구") {
    x = 127.039;
    y = 37.56061111;
  } else if (locationname == "성북구") {
    x = 127.0203333;
    y = 37.58638333;
  } else if (locationname == "송파구") {
    x = 127.1079306;
    y = 37.51175556;
  } else if (locationname == "양천구") {
    x = 126.8687083;
    y = 37.51423056;
  } else if (locationname == "영등포구") {
    x = 126.8983417;
    y = 37.52361111;
  } else if (locationname == "용산구") {
    x = 126.9675222;
    y = 37.53609444;
  } else if (locationname == "은평구") {
    x = 126.9312417;
    y = 37.59996944;
  } else if (locationname == "종로구") {
    x = 126.9816417;
    y = 37.57037778;
  } else if (locationname == "중구") {
    x = 126.9996417;
    y = 37.56100278;
  } else if (locationname == "중랑구") {
    x = 127.0947778;
    y = 37.60380556;
  } else {
    console.log("Invalid location name.");
    process.exit(1);
  }

  const options = {
    hostname: "api.vworld.kr",
    port: 80,
    path: `/req/data?service=data&request=GetFeature&data=LT_L_FRSTCLIMB&key=6D2258E0-3B1B-39D9-8C4C-F17EFDAB3FF9&domain=ec2-13-209-155-211.ap-northeast-2.compute.amazonaws.com::8888&geomFilter=point(${x}%20${y})&buffer=5000`,
    method: "GET",
  };
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        const result = JSON.parse(data);
        const mntn_nm =
          result.response.result.featureCollection.features[0].properties
            .mntn_nm;
        const resultJson = { locationname, mntn_nm };
        resolve(resultJson);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}

const jsonContent = fs.readFileSync("key.json", "utf8");
const keys = JSON.parse(jsonContent);

// S3 객체 생성
const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey,
});

const locationName = req.query.location;

// 첫 번째 함수 실행
const gymResult = searchGym(locationName);

// S3에서 CSV 파일 다운로드 및 처리하여 결과 반환
s3.getObject(
  {
    Bucket: "iotfitbyte",
    Key: "gym.csv",
  },
  (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    // CSV 데이터를 문자열로 변환
    const csvString = data.Body.toString();

    // CSV 데이터를 줄 단위로 분할하여 배열로 저장
    const lines = csvString.split("\n");

    // 위치와 이름을 저장할 객체
    const gyms = {};

    // 각 줄에서 위치와 이름 추출하여 gyms 객체에 저장
    lines.forEach((line) => {
      // 쉼표를 기준으로 위치와 이름을 분리
      const [locations, name] = line.split(",");
      //if(locations ==NULL|| name ==NULL){

      //}
      //else{
      // 위치가 이미 gyms 객체에 저장되어 있다면 이름을 추가, 없다면 새로운 위치를 추가하고 이름을 저장
      if (gyms[locations]) {
        gyms[locations].push(name);
      } else {
        gyms[locations] = [name];
      }
      //}
    });

    // 입력한 위치와 일치하는 이름들을 gyms 객체에서 찾아서 배열로 반환
    const gymNames = gyms[locations] || [];

    // 가져올 항목 개수 설정 (여기서는 5개)
    const limit = 5;

    // 배열의 처음부터 limit 개수만큼 잘라서 새로운 배열 생성
    const limitedGymNames = gymNames.slice(0, limit);

    //// 결과를 JSON 형식으로 반환
    const csvResult = { locations, gyms: limitedGymNames };
    const resultJson = { locationname, mntn_nm };

    // Create a merged result object
    const mergedResult = {
      locationname: resultJson.locationname,
      mntn_nm: resultJson.mntn_nm,
      gyms: csvResult.gyms,
    };
    console.log(mergedResult);
  }
);
