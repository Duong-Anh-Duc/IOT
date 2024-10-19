const mqttClient = require("../config/mqttConfig").mqttClient;
const saveSensorData = require('../controllers/sensorController').saveSensorData;
let messageHandler = null; 

module.exports.publishMessage = (topic, message) => {
    mqttClient.publish(topic, message, (err) => {
        if (err) {
            console.log(`Failed to publish message: ${err}`);
        } else {
            console.log(`Message "${message}" sent to topic "${topic}"`);
        }
    });
};

module.exports.subscribeToTopic = (topics) => {
    if (!Array.isArray(topics)) {
        topics = [topics];
    }
    topics.forEach(topic => {
        mqttClient.subscribe(topic, (err) => {
            if (err) {
                console.log(`Failed to subscribe to topic "${topic}": ${err}`);
            } else {
                console.log(`Subscribed to topic "${topic}" successfully`);
            }
        });
    });
    if (messageHandler) {
        mqttClient.removeListener('message', messageHandler);
    }

    messageHandler = (receivedTopic, message) => {
        const sensorData = message.toString();
        if (receivedTopic === 'home/sensor') {
            const [temperature, humidity, light, windSpeed] = sensorData.split(' ').map(value => Number(value));
            console.log(`Received weather data:`);
            console.log(`Temperature: ${temperature}`);
            console.log(`Humidity: ${humidity}`);
            console.log(`Light: ${light}`);
            console.log(`Wind Speed: ${windSpeed}`);

            if (!isNaN(temperature) && !isNaN(humidity) && !isNaN(light) && !isNaN(windSpeed)) {
                saveSensorData(temperature, humidity, light, windSpeed);
            } else {
                console.error('Invalid weather data received:', sensorData);
            }

        } else if (receivedTopic === 'home/device/status') {
            console.log(`Received device status message from "${receivedTopic}": ${sensorData}`);
            const [deviceId, status] = sensorData.split(':');
            console.log(`Device ID: ${deviceId}, Status: ${status}`);
        }
    };
    mqttClient.on('message', messageHandler);
};

