const mqtt = require("mqtt");
const SensorLog = require("../models/sensorlog");

var client;

const listenMQTT = () => {
  try{
    client = mqtt.connect("mqtt://13.209.155.211:1883");
  } catch(err) {
    console.log("Connect server for listening mqtt failure");
    return;
  }
  console.log("Now listening MQTT Server")
  client.subscribe("fitByte/temperature");
  client.subscribe("fitByte/pressure");
  client.subscribe("fitByte/humidity");
  client.subscribe("fitByte/pmtwofive");
  client.subscribe("fitByte/pmten");

  client.on("message", function (topic, message) {
    console.log(`토픽: ${topic.toString()}, 메시지: ${message.toString()}`);
    SensorLog.create(
      {
        type: topic,
        value: message
      },
    )
  });
};

module.exports = listenMQTT;
