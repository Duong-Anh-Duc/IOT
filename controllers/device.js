const Device = require("../models/device")
const History = require("../models/history")
const Weather = require("../models/weather")
const mqttService = require("../services/mqttService")
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
module.exports.saveSensorData = async (temperature, humidity, light) => {
  try {
      const newData = new Weather({
          temperature,
          humidity,
          light,
      });
      await newData.save()
      console.log('Dữ liệu cảm biến đã được lưu');
  } catch (error) {
      console.error('Lỗi khi lưu dữ liệu cảm biến:', error);
  }
};
module.exports.history2 = async (req, res) => {
    const records = await Weather.find()
      res.render("../views/history2.pug", {
            records : records,
      })
}
module.exports.history1 = async (req, res) => {
    let filter = req.query.deviceFilter || 'all';
    let page = parseInt(req.query.page) || 1;  
    let limit = parseInt(req.query.limit) || 10; 
    let skip = (page - 1) * limit;  
    let totalRecords = filter === 'all' || !filter ? 
                        await History.countDocuments() : 
                        await History.countDocuments({ Name: filter });

    let data = filter !== 'all' && filter ? 
                await History.find({ Name: filter }).skip(skip).limit(limit) : 
                await History.find().skip(skip).limit(limit);
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
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.render("../partials/deviceTable.pug", {
            data: data,
            deviceFilter: filter,
            currentPage: page,
            totalPages: Math.ceil(totalRecords / limit),
            limit: limit
        });
    }
    res.render("../views/history1.pug", {
        data: data,
        deviceFilter: filter,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit), 
        limit: limit
    });
};
module.exports.changeStatus = async (req, res) => {
    const TT = req.params.TT;
    const id = req.params.id;
    await Device.updateOne({_id: id}, {TT: TT});
    const data = await Device.findOne({_id: id});
  
    await History.create({
      Name: data.Name,
      TT: data.TT
    });
    if(id === "66d6bb0cef816034999be0f6"){
        const mqttMessage = TT === "on" ? "all:1" : "all:0";
        mqttService.publishMessage('home/device/control', mqttMessage);
    }
    res.json({ newStatus: data.TT });
  };