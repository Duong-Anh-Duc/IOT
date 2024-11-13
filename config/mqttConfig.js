const mqtt = require("mqtt")
module.exports.mqttClient = mqtt.connect('mqtt://192.168.43.28', {
    username: 'duc123',
    password: '123',
    port: 1884
  });
  