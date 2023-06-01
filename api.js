const http = require("http");
const fs = require("fs");

const locationname = process.argv[2];
function searchGym(locationname) {
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
        console.log(resultJson);
        resolve(resultJson);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}

searchGym(locationname);