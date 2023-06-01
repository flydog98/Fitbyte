const AWS = require('aws-sdk');
const fs = require('fs');

// S3 객체 생성
const s3 = new AWS.S3({
        accessKeyId: 'AKIAUMX2QPW4NTIEZYJI',
        secretAccessKey: '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',
});

// 사용자로부터 입력 받은 위치
const locations = process.  argv[2];

if (!locations) {
        console.error('Usage: node tests3.js <locations>');
        return;
}

// S3에서 CSV 파일 다운로드
s3.getObject({
        Bucket: 'iotfitbyte',
        Key: 'gym.csv',
}, (err, data) => {
        if (err) {
                console.error(err);
                return;
        }

        // CSV 데이터를 문자열로 변환
        const csvString = data.Body.toString();

        // CSV 데이터를 줄 단위로 분할하여 배열로 저장
        const lines = csvString.split('\n');

        // 위치와 이름을 저장할 객체
        const gyms = {};

        // 각 줄에서 위치와 이름 추출하여 gyms 객체에 저장
        lines.forEach(line => {
                // 쉼표를 기준으로 위치와 이름을 분리
                const [locations, name] = line.split(',');
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
        const result = { locations, gyms: limitedGymNames  };
        //const result = { locations, gyms: gymNames };
        console.log(JSON.stringify(result, null, 2));
        
        // 결과를 JSON 파일로 출력
        /*
        const result = { locations, gyms: gymNames };
        const jsonString = JSON.stringify(result, null, 2);
        fs.writeFileSync('result.json', jsonString);

        console.log(`Gyms in ${locations}: ${gymNames.join(', ')}`);
        */
});
