const express = require('express');
const router = express.Router();
const deviceController = require("../controllers/deviceController");
const historyDeviceController = require("../controllers/historyDeviceController")
const historySensorController = require("../controllers/historySensorController")
const sensorController= require("../controllers/sensorController")
const { uploadAvatar } = require('../config/uploadAvatar');
router.get("/profile", (req, res) => {
    res.render("profile.pug");
});
router.get("/devicePage", historyDeviceController.devicePage);
router.get("/deviceData", historyDeviceController.deviceData);
router.get("/weatherPage", historySensorController.weatherPage);
router.get("/weatherData", historySensorController.weatherData);
router.get("/", deviceController.index);
router.post("/change-status/:TT/:id", deviceController.changeStatus);
router.get("/sensor-data", sensorController.getSensorData);
router.post('/upload-avatar', uploadAvatar);

module.exports = router;
