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
router.get("/weatherPage2", historySensorController.weatherPage2);
router.get("/api/deviceData", historyDeviceController.deviceData);
router.get("/weatherPage", historySensorController.weatherPage);
router.get("/api/weatherData", historySensorController.weatherData);
router.get("/", deviceController.index);
router.post("/api/change-status", deviceController.changeStatus);
router.get("/sensor-data", sensorController.getSensorData);
router.post('/upload-avatar', uploadAvatar);

module.exports = router;
