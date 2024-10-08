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
module.exports.getSensorData = async (req, res) => {
    try {
        const latestData = await Weather.findOne().sort({ createdAt: -1 });
        if (latestData) {
            res.json({
                success: true,
                temperature: latestData.temperature,
                humidity: latestData.humidity,
                light: latestData.light
            });
        } else {
            res.json({
                success: false,
                message: 'No sensor data available'
            });
        }
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        res.status(500).json({ success: false, message: 'Error fetching sensor data' });
    }
};
module.exports.saveSensorData = async (temperature, humidity, light) => {
    try {
        const currentDate = new Date();
        const Day = currentDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const Hour = currentDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
        const newData = new Weather({
            temperature,
            humidity,
            light,
            Day,  
            Hour  
        });
        
        await newData.save();
        console.log('Dữ liệu cảm biến đã được lưu');
    } catch (error) {
        console.error('Lỗi khi lưu dữ liệu cảm biến:', error);
    }
  };
  
  module.exports.history2 = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let temperatureSort = req.query.temperatureSort || 'none';
    let humiditySort = req.query.humiditySort || 'none';
    let lightSort = req.query.lightSort || 'none';
    let dateFilter = req.query.dateFilter;
    let skip = (page - 1) * limit;
    let query = {};

    if (dateFilter) {
        let startOfDay = new Date(dateFilter);
        startOfDay.setHours(0, 0, 0, 0);
        let endOfDay = new Date(dateFilter);
        endOfDay.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    let totalRecords = await Weather.countDocuments(query);

    let sortQuery = {};
    if (temperatureSort !== 'none') {
        sortQuery.temperature = temperatureSort === 'asc' ? 1 : -1;
    }
    if (humiditySort !== 'none') {
        sortQuery.humidity = humiditySort === 'asc' ? 1 : -1;
    }
    if (lightSort !== 'none') {
        sortQuery.light = lightSort === 'asc' ? 1 : -1;
    }

    let records = await Weather.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);

    const totalPages = Math.ceil(totalRecords / limit);
    const pagination = paginationRange(page, totalPages);

    res.render("../views/history2.pug", {
        records: records,
        temperatureSort: temperatureSort,
        humiditySort: humiditySort,
        lightSort: lightSort,
        currentPage: page,
        totalPages: totalPages,
        pagination: pagination,
        limit: limit,
        dateFilter: dateFilter  
    });
};
function paginationRange(currentPage, totalPages, delta = 2) {
    const range = [];
    const rangeWithDots = [];
    let l;
  
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }
  
    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });
  
    return rangeWithDots;
  }
module.exports.history1 = async (req, res) => {
    let filter = req.query.deviceFilter || 'all';
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let sortOrder = req.query.sortOrder || 'asc';
    let dateFilter = req.query.dateFilter;
    let skip = (page - 1) * limit;
    let query = {};

    if (filter !== 'all') {
        query.Name = filter;
    }

    if (dateFilter) {
        let startOfDay = new Date(dateFilter);
        startOfDay.setHours(0, 0, 0, 0);
        let endOfDay = new Date(dateFilter);
        endOfDay.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: startOfDay, $lte: endOfDay };  
    }

    let totalRecords = await History.countDocuments(query);

    let data = await History.find(query)
                             .sort({ createdAt: sortOrder === 'asc' ? 1 : -1 })
                             .skip(skip)
                             .limit(limit);

    const totalPages = Math.ceil(totalRecords / limit);
    const pagination = paginationRange(page, totalPages);

    res.render("../views/history1.pug", {
        data: data,
        deviceFilter: filter,
        currentPage: page,
        totalPages: totalPages,
        pagination: pagination,
        limit: limit,
        sortOrder: sortOrder,
        dateFilter: dateFilter  
    });
};

module.exports.changeStatus = async (req, res) => {
    const TT = req.params.TT;
    const id = req.params.id;
    await Device.updateOne({ _id: id }, { TT: TT });
    const data = await Device.findOne({ _id: id });
    const currentDate = new Date();
    const day = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
    const hour = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;
    await History.create({
        Name: data.Name,
        TT: data.TT,
        Day: day,         
        Hour: hour        
    });
    if (id === "66d6bb0cef816034999be0f6") {
        const mqttMessage = TT === "on" ? "1:1" : "1:0";
        mqttService.publishMessage('home/device/control', mqttMessage);
    }
    else if(id === "66d6f12def816034999be122"){
        const mqttMessage = TT === "on" ? "2:1" : "2:0";
        mqttService.publishMessage('home/device/control', mqttMessage);
    }
    else if(id === "66d6f13cef816034999be124"){
        const mqttMessage = TT === "on" ? "3:1" : "3:0";
        mqttService.publishMessage('home/device/control', mqttMessage);
    }
    res.json({ newStatus: data.TT });
};
