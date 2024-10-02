const Device = require("../models/device")
const History = require("../models/history")
const mqtt = require("mqtt")
const mqttClient = mqtt.connect('mqtt://192.168.43.28', {
  username: 'duc123',
  password: '123',
  port: 1884
});
module.exports.index = async (req, res) => {
    const device = await Device.find({})
        res.render("../views/index.pug", {
            pageTitle : "hehe",
            lamp : device[0],
            fan : device[1],
            air_conditioner : device[2]
        }
        )
}
const publishMessage = (topic, message) => {
    mqttClient.publish(topic, message, (err) => {
      if (err) {
        console.log(`Failed to publish message: ${err}`);
      } else {
        console.log(`Message "${message}" sent to topic "${topic}"`);
      }
    });
  };
module.exports.history2 = async (req, res) => {
    const records = [
        {temperature: "30°C", humidity: "65%", light: "500 Lux", time: "04/09/2024 00:04:37"},
        {temperature: "29°C", humidity: "60%", light: "520 Lux", time: "04/09/2024 00:10:50"},
        {temperature: "28°C", humidity: "63%", light: "510 Lux", time: "04/09/2024 00:15:20"},
        {temperature: "31°C", humidity: "67%", light: "530 Lux", time: "04/09/2024 00:20:15"},
        {temperature: "30°C", humidity: "65%", light: "500 Lux", time: "04/09/2024 00:25:30"},
        {temperature: "29°C", humidity: "60%", light: "520 Lux", time: "04/09/2024 00:30:45"},
        {temperature: "28°C", humidity: "63%", light: "510 Lux", time: "04/09/2024 00:35:00"},
        {temperature: "31°C", humidity: "67%", light: "530 Lux", time: "04/09/2024 00:40:15"},
        {temperature: "30°C", humidity: "65%", light: "500 Lux", time: "04/09/2024 00:45:30"},
        {temperature: "29°C", humidity: "60%", light: "520 Lux", time: "04/09/2024 00:50:45"},
        {temperature: "28°C", humidity: "63%", light: "510 Lux", time: "04/09/2024 00:55:00"},
        {temperature: "31°C", humidity: "67%", light: "530 Lux", time: "04/09/2024 01:00:15"},
        {temperature: "30°C", humidity: "65%", light: "500 Lux", time: "04/09/2024 01:05:30"},
        {temperature: "29°C", humidity: "60%", light: "520 Lux", time: "04/09/2024 01:10:45"},
        {temperature: "28°C", humidity: "63%", light: "510 Lux", time: "04/09/2024 01:15:00"},
        {temperature: "31°C", humidity: "67%", light: "530 Lux", time: "04/09/2024 01:20:15"},
        {temperature: "30°C", humidity: "65%", light: "500 Lux", time: "04/09/2024 01:25:30"},
        {temperature: "29°C", humidity: "60%", light: "520 Lux", time: "04/09/2024 01:30:45"},
        {temperature: "28°C", humidity: "63%", light: "510 Lux", time: "04/09/2024 01:35:00"},
        {temperature: "31°C", humidity: "67%", light: "530 Lux", time: "04/09/2024 01:40:15"},
        {temperature: "30°C", humidity: "65%", light: "500 Lux", time: "04/09/2024 01:45:30"},
        {temperature: "29°C", humidity: "60%", light: "520 Lux", time: "04/09/2024 01:50:45"},
        {temperature: "28°C", humidity: "63%", light: "510 Lux", time: "04/09/2024 01:55:00"},
        {temperature: "31°C", humidity: "67%", light: "530 Lux", time: "04/09/2024 02:00:15"}
      ]
      res.render("../views/history2.pug", {
            records : records,
      })
}
module.exports.history1 = async (req, res) => {
    let filter = req.query.deviceFilter;
    console.log(filter)
    let data = [];
    if(filter != 'all' && filter){
        data = await History.find({Name : filter});
    }
    else if(filter == 'all' || !filter){
        data = await History.find();
    }
    data.forEach(item => {
        const date = new Date(item.createdAt);
        item.DateandHour = date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) + ' ' + date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    });
    res.render("../views/history1.pug", {
        data: data,
        deviceFilter : filter
    });
};

module.exports.changeStatus = async (req, res) => {
    const TT = req.params.TT;
    const id = req.params.id;
    console.log(id)
    // Cập nhật trạng thái thiết bị
    await Device.updateOne({_id: id}, {TT: TT});
    const data = await Device.findOne({_id: id});
  
    // Lưu lịch sử
    await History.create({
      Name: data.Name,
      TT: data.TT
    });
    if(id === "66d6bb0cef816034999be0f6"){
        const mqttMessage = TT === "on" ? "all:1" : "all:0";
        publishMessage('home/device/control', mqttMessage);
    }
    // Trả về phản hồi JSON với trạng thái mới
    res.json({ newStatus: data.TT });
  };