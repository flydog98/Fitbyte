## 목자 (Table of Contents)

- [목자 (Table of Contents)](#목자-table-of-contents)
- [FitByte 🏃‍♂️🏃‍♀️](#fitbyte-️️)
- [FitByte 기능 🚀](#fitbyte-기능-)
- [FitByte 구성 🔎](#fitbyte-구성-)
- [FitByte 구조 📚](#fitbyte-구조-)
  - [사용된 기술 스택/장비/구성요소](#사용된-기술-스택장비구성요소)
    - [FitByte Website](#fitbyte-website)
    - [Fitbit](#fitbit)
    - [Raspberry Pi](#raspberry-pi)
    - [Monitoring](#monitoring)
- [사전 준비 🎨](#사전-준비-)
  - [공공데이터포털](#공공데이터포털)
  - [MongoDB](#mongodb)
  - [AWS Secret Key](#aws-secret-key)
  - [AWS IoT Core](#aws-iot-core)
  - [Raspberry Pi](#raspberry-pi-1)
  - [모니터링](#모니터링)
  - [S3](#s3)
  - [Fitbit](#fitbit-1)
- [빌드 📝](#빌드-)
  - [로컬 빌드](#로컬-빌드)
  - [AWS 빌드](#aws-빌드)

(2023년 1학기 건국대학교 IoT Cloud 서비스 수업 과제로 만들어진 프로젝트이며, 상용 프로젝트가 아니었음을 밝힙니다.)

## FitByte 🏃‍♂️🏃‍♀️

> 매번 운동 계획을 세워 두고 작심삼일... 혹시 익숙하신 분 계신가요...?  
그렇다면 혹시 여러분의 계획을 다른 사람에게 말함으로써 그 계획을 이룰 수 있는 확률이 올라간다는 사실 알고 계신가요?  
FitByte는 여러분 스스로 여러분의 운동 계획을 약속하고 약속한 계획을 실천하도록 도와주는 어플리케이션입니다!  
FitByte를 통해 여러분의 운동 계획을 공유하고, 계획에서 끝나지 않게 실천해 보세요!  

## FitByte 기능 🚀

* 일일 운동 총량 계획

  사용자는 매일매일 그날의 운동 시간을 목표로 세울 수 있습니다. 이때 사용자가 세운 계획은 Fitbit의 생체 정보를 통해 검증됩니다.

* 세부 운동 계획

  시간 뿐만 아니라 미래의 계획 또한 설정이 가능합니다. 일일 총량 계획에 더해 세부적인 계획을 수립할 수 있습니다.

* 환경 대시보드

  Raspberry Pi 센서를 통해 수집되는 정보를 대시보드 형태로 만나볼 수 있습니다.

* 주변 운동시설 정보

  [공공데이터포털](https://www.data.go.kr/)등에서 수집한 공공데이터 정보와 사용자의 위치 입력 정보를 바탕으로 주변 운동 시설과 등산 정보를 보여줍니다.

## FitByte 구성 🔎

* Fitbit

  FitByte는 Fitbit을 통해 수집되는 생체 정보를 통해 여러분의 운동 약속 이행 여부를 확인합니다!  
  Fitbit에서 제공하는 API를 이용하고 있으며, 원활한 사용을 위해서는 몇 가지 사용자 동의가 필요합니다.  
  테스트의 사용된 모델은 Fitbit Charge 5 모델입니다.  
  [Fitbit Charge 5 공식 사이트 방문](https://www.fitbit.com/global/kr/products/trackers/charge5)  

* Raspberry Pi

  FitByte는 Raspberry Pi에 장착된 센서를 통해 주변 환경 정보를 수집하여 야외 활동에 적합한 환경인지 판단할 수 있게 도와줍니다.  
  도시에서 주로 운동하신다면 미세먼지 센서, 산행과 같이 더 익스트림한 운동을 즐기신다면 온/습도 기압 센서를 통해 현재 주변 상황을 대시보드 형태로 실시간 모니터링할 수 있습니다.  
  센서를 통해 수집된 정보는 대시보드 형태로 제공되며, 원하는 기간 역시 선택이 가능합니다.
  테스트에 사용한 모델은 라즈베리 파이 4B 모델입니다.
  [Raspberry Pi 4B 공식 사이트 방문](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/)

* 웹 접속가능 기기
  
  이는 FitByte에서 제공하는 사항은 아니지만, FitByte 서비스는 웹상에서 제공되기 때문에 인터넷 접속이 가능한 기기가 필요합니다. 주로 (그리고 당연히) 개인 스마트폰 혹은 컴퓨터가 이에 해당합니다.

## FitByte 구조 📚

다음은 FitByte의 아키텍처를 도식화한 사진입니다.  
![FitByte Architecure](./Resources/FitByte%20Architecture.png)

### 사용된 기술 스택/장비/구성요소

#### FitByte Website

* `AWS Lambda`: 서버리스 환경에서 웹 서비스 제공
* `API Gateway`: 요청에 따라 알맞은 AWS Lambda 함수 실행
* `MongoDB`: 사용자 정보, 메타 정보 등 데이터 보관
* `AWS S3`: 정적 데이터(운동시설 정보 등) 보관
* `공공데이터포털`: API를 통한 등산 정보 검색

#### Fitbit

* `Fitbit Charge 5`: 사용자가 착용하고 운동 여부를 확인하는 장치
* `Fitbit Application`: Fitbit API를 통해 사용자 데이터를 확보

#### Raspberry Pi

* `BME280 센서`: 온도/습도/기압 측정
* `Nova PM SDS011 센서`: 미세먼지 측정
* `AWS IoT Core`: 메시지 브로커 역할

#### Monitoring

* `MQTT2Prometheus`: IoT Core로부터 메시지를 받아 메트릭 형태로 변환하여 노출하는 익스포터
* `Prometheus`: 익스포터로부터 메트릭 수집 및 저장
* `Grafana`: 프로메테우스 데이터로부터 대시보드 생성
* `AWS EC2`: 모니터링 툴, MongoDB 배포

## 사전 준비 🎨

> 빌드에 앞서...

해당 프로젝트의 구성 요소로 AWS가 있으며 API를 가져오기 위한 Key, DB를 이용하기 위한 세팅, Raspberry Pi 세팅들이 있습니다. 또한 Raspberry Pi로부터 수집된 정보를 모니터링하기 위한 시스템 또한 배포해야 합니다.  
그렇기 때문에 단순히 이 저장소를 Git Clone하는것 만으로는 프로젝트를 빌드할 수 없습니다. 따라서 프로젝트 빌드를 위한 사전 작업들을 먼저 안내드리겠습니다.  

### 공공데이터포털

먼저 공공데이터를 이용하기 위한 API Key를 발급받아야 합니다.  
등산로 정보는 공공데이터포털을 통해 안내받은 [vWorld 오픈 API](https://www.vworld.kr/dev/v4dv_2ddataguide2_s002.do?svcIde=frstclimb)로부터 제공받습니다.  
해당 사이트 링크에서 안내받을 수 있는 방법대로 API Key를 발급받으면 됩니다.  

### MongoDB

위 FitByte 구조에 따르면 데이터베이스는 EC2 상에 도커 컨테이너 형태로 배포되어 있으나, MongoDB의 배포 형태는 중요하지 않습니다.  
원하는 방식대로 MongoDB를 구축한 뒤, MongoDB URI를 `config/db_secret-exmple.json`의 형태에 맞추어 해당 디렉토리에 `db_secret.json` 파일명으로 저장해야 합니다.

### AWS Secret Key

AWS 서비스(S3 등)를 이용하고 있기 때문에 AWS IAM에서 생성한 유저의 Access Key가 필요합니다.  
AWS IAM에서 유저를 생성한 뒤 `config/key-example.json`형식에 맞추어 Access Key와 Secret Access Key를 입력하고, `key.json` 파일명으로 저장해야 합니다.

### AWS IoT Core

라즈베리 파이로부터 메시지를 수신받을 메시지 브로커인 IoT Core에 대한 설정이 필요합니다.  
[AWS IoT Core 페이지](https://aws.amazon.com/ko/iot-core/)에서 IoT Core를 생성하고 엔드포인트를 노출합니다.  
그리고 Certificate를 생성한 뒤 mqtt/publish 파일에 해당 정보들을 업데이트합니다.  
이후 해당 파일을 Raspberry Pi에 옮겨야 합니다.

### Raspberry Pi

라즈베리 파이는 센서를 통해 수집한 데이터를 AWS IoT Core로 Publish하는 역할을 담당합니다.  
파이썬을 실행할 수 있는 운영체제라면 상관없지만, 프로젝트 당시에는 Raspbian 운영체제를 사용했습니다.  
Raspberry Pi에 Raspbian을 설치한 뒤, BME280, Nova PM SDS011 센서를 연결합니다.  
이후 앞서 IoT Core 관련 설정을 적용한 publish.py 파일을 Raspberry Pi에 저장한 뒤 실행하면 자동으로 IoT Core를 향해 수집 데이터 정보가 전달됩니다.

### 모니터링

모니터링 툴에는 익스포터(MQTT2Prometheus), Prometheus, Grafana가 있습니다.  
해당 스택들은 어디에 배포되어도 상관 없지만, 프로젝트 상에서는 관리의 편의를 위해 AWS EC2 내에 도커 컨테이너 형태로 배포되었습니다.  

### S3

이하 작성 예정...

### Fitbit

## 빌드 📝

### 로컬 빌드

### AWS 빌드

기본적으로 FityByte는 AWS를 이용하여 배포되도록 설계되었습니다.  
