const Device = require("../models/deviceModel");
const mqttService = require("../services/mqttService");
const History = require("../models/historyModel");
const { mqttClient } = require("../config/mqttConfig");
module.exports.index = async (req, res) => {
    const device = await Device.find({});
    res.render("../views/index.pug", {
        pageTitle : "hehe",
        lamp : device[0],
        fan : device[1],
        air_conditioner : device[2],
        device : device[3]
    });
};
module.exports.index1 = async(req, res) => {
    const device = await Device.find({});
    res.render("../views/index1.pug", {
        pageTitle : "hehe",
        lamp : device[0],
        fan : device[1],
        air_conditioner : device[2],
        device : device[3]
    });
}
module.exports.changeStatus = async (req, res) => {
    const { status, id } = req.body;
    console.log(req.body);

    let mqttMessage;
    switch (id) {
        case "1":
            mqttMessage = status === "on" ? "1:1" : "1:0";
            break;
        case "2":
            mqttMessage = status === "on" ? "2:1" : "2:0";
            break;
        case "3":
            mqttMessage = status === "on" ? "3:1" : "3:0";
            break;
        case "4":
            mqttMessage = status === "on" ? "4:1" : "4:0";
            break;
        default:
            return res.status(400).json({ error: 'Invalid status or ID' });
    }
    mqttService.publishMessage('home/device/control', mqttMessage);
    mqttService.subscribeToTopic('home/device/status');
    const timeout = setTimeout(() => {
        mqttClient.removeListener('message', messageHandler);
        return res.status(500).json({ error: 'MQTT response not received in time' });
    }, 5000);

    let messageHandler = async (receivedTopic, message) => {
        const sensorData = message.toString();
        if (receivedTopic === 'home/device/status' && sensorData === mqttMessage) {
            console.log(`Received device status: ${sensorData}`);
            clearTimeout(timeout);
            await Device.updateOne({ stt: id }, { status: status });
            const data = await Device.findOne({ stt: id });
            const currentDate = new Date();
            const day = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
            const hour = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;

            await History.create({
                name: data.name,
                status: data.status,
                day: day,
                hour: hour
            });
            mqttClient.removeListener('message', messageHandler);
            res.json({ 
                message : "Change-Status success!",
                status: data.status });
        }
    };
    mqttClient.on('message', messageHandler);
};
