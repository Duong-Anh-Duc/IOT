const Device = require("../models/deviceModel");
const mqttService = require("../services/mqttService");
const History = require("../models/historyModel");
module.exports.index = async (req, res) => {
    const device = await Device.find({});
    res.render("../views/index.pug", {
        pageTitle : "hehe",
        lamp : device[0],
        fan : device[1],
        air_conditioner : device[2]
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
    let mqttMessage;
    switch (id) {
        case "66d6bb0cef816034999be0f6":
            mqttMessage = TT === "on" ? "1:1" : "1:0";
            break;
        case "66d6f12def816034999be122":
            mqttMessage = TT === "on" ? "2:1" : "2:0";
            break;
        case "66d6f13cef816034999be124":
            mqttMessage = TT === "on" ? "3:1" : "3:0";
            break;
    }
    if (mqttMessage) {
        mqttService.publishMessage('home/device/control', mqttMessage);
    }
    res.json({ newStatus: data.TT });
};
