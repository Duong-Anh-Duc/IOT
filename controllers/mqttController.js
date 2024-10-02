const mqtt = require('mqtt');

// Kết nối tới MQTT broker
const mqttClient = mqtt.connect('mqtt://192.168.43.28', {
  username: 'duc123',  // MQTT Username
  password: '123',     // MQTT Password
  port: 1884           // MQTT Port
});

// Biến lưu trữ giá trị mới nhất từ cảm biến
let sensorData = {
  temperature: null,
  humidity: null,
  light: null
};

// Khi kết nối tới MQTT broker thành công
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  
  // Subscribe vào topic nhận dữ liệu cảm biến
  mqttClient.subscribe('home/sensor', (err) => {
    if (!err) {
      console.log('Subscribed to topic: home/sensor');
    }
  });
});

// Khi nhận được dữ liệu từ MQTT
mqttClient.on('message', (topic, message) => {
  const payload = message.toString();


  // Tách và xử lý dữ liệu từ chuỗi
  const [temperature, humidity, light] = payload.split(' ');
  
  // Cập nhật dữ liệu mới vào biến sensorData
  sensorData.temperature = parseFloat(temperature);
  sensorData.humidity = parseFloat(humidity);
  sensorData.light = parseInt(light, 10);

});

// Hàm lấy dữ liệu cảm biến mới nhất
const getSensorData = () => {
  return sensorData;
};

module.exports = {
  getSensorData
};
