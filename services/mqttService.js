const mqttClient = require("../config/mqttConfig").mqttClient;
const saveSensorData = require('../controllers/sensorController').saveSensorData;
const History = require('../models/historyModel'); // Import model History nếu chưa có
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
    // Chuyển topics thành mảng nếu nó không phải là mảng
    if (!Array.isArray(topics)) {
        topics = [topics];
    }

    // Đăng ký từng topic
    topics.forEach(topic => {
        mqttClient.subscribe(topic, (err) => {
            if (err) {
                //console.log(`Failed to subscribe to topic "${topic}": ${err}`);
            } else {
                //console.log(`Subscribed to topic "${topic}" successfully`);
            }
        });
    });

    //console.log("Subscribed topics:", topics);

    if (messageHandler) {
        mqttClient.removeListener('message', messageHandler);
    }

    messageHandler = async (receivedTopic, message) => {
        const sensorData = message.toString();
    
        if (receivedTopic === 'home/sensor') {
            // Xử lý dữ liệu cảm biến
            const [temperature, humidity, light, windSpeed] = sensorData.split(' ').map(value => Number(value));
            if (!isNaN(temperature) && !isNaN(humidity) && !isNaN(light) && !isNaN(windSpeed)) {
                await saveSensorData(temperature, humidity, light, windSpeed);
            }
        } else if (receivedTopic === 'home/device/status') {
            // Xử lý dữ liệu từ topic cũ cho các thiết bị khác
            const [deviceId, status] = sensorData.split(':');
            if (deviceId === '4') {
                // Nếu cần, xử lý trạng thái chung của LED4 ở đây
            }
        } else if (receivedTopic === 'home/device/led4/status') {
            // Xử lý riêng trạng thái nhấp nháy của LED4
            const ledStatus = sensorData === 'on' ? 'on' : 'off';
            const currentDate = new Date();
            const day = currentDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const hour = currentDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
            await History.create({
                name: "CB gió",
                status: ledStatus,
                day: day,
                hour: hour
            });
    
            //console.log(`LED4 status from new topic saved to History: ${ledStatus}`);
        } else {
            //console.log(`Unexpected topic received: ${receivedTopic}`);
        }
    };

    mqttClient.on('message', messageHandler);
};

// Gọi hàm subscribe với cả hai topics
module.exports.subscribeToTopic(['home/sensor', 'home/device/status', 'home/device/led4/status']);
