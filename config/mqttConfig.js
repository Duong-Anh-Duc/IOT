const mqtt = require("mqtt")
module.exports.mqttClient = mqtt.connect('mqtt://192.168.1.3', {
    username: 'duc123',
    password: '123',
    port: 1884
  });