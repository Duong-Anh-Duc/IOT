const Weather = require("../models/weatherModel");
module.exports.getSensorData = async (req, res) => {
    try {
        const latestData = await Weather.findOne().sort({ createdAt: -1 });
        if (latestData) {
            res.json({
                success: true,
                temperature: latestData.temperature,
                humidity: latestData.humidity,
                light: latestData.light,
                windSpeed: latestData.windSpeed 
            });
        } else {
            res.json({ success: false, message: 'No sensor data available' });
        }
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        res.status(500).json({ success: false, message: 'Error fetching sensor data' });
    }
};
module.exports.saveSensorData = async (temperature, humidity, light, windSpeed) => {
    try {
        const currentDate = new Date();
        const day = currentDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const hour = currentDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newData = new Weather({
            temperature,
            humidity,
            light,
            windSpeed, 
            day,
            hour
        });

        await newData.save();
        console.log('Dữ liệu cảm biến đã được lưu');
    } catch (error) {
        console.error('Lỗi khi lưu dữ liệu cảm biến:', error);
    }
};

