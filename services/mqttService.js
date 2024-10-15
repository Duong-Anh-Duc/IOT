const mqttClient = require("../config/mqttConfig").mqttClient;
const  saveSensorData  = require('../controllers/sensorController').saveSensorData; 
module.exports.publishMessage = (topic, message) => {
    mqttClient.publish(topic, message, (err) => {
      if (err) {
        console.log(`Failed to publish message: ${err}`);
      } else {
        console.log(`Message "${message}" sent to topic "${topic}"`);
      }
    });
  };
  module.exports.subscribeToTopic = (topic) => {
    mqttClient.subscribe(topic, (err) => {
      if (err) {
        console.log(`Failed to subscribe to topic "${topic}": ${err}`);
      } else {
        console.log(`Subscribed to topic "${topic}" successfully`);
      }
    });
  
    mqttClient.on('message', (receivedTopic, message) => {
      if (receivedTopic === topic) {
          const sensorData = message.toString();
          console.log(`Received message from topic "${receivedTopic}": ${sensorData}`);
          const [temperature, humidity, light] = sensorData.split(' ').map(value => Number(value));
          console.log(temperature);
          console.log(humidity);
          console.log(light);
          if (!isNaN(temperature) && !isNaN(humidity) && !isNaN(light)) {
              saveSensorData(temperature, humidity, light);
          } else {
              console.error('Invalid data received:', sensorData);
          }
      }
    });
  };