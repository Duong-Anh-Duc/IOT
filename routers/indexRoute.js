const express = require('express');
const router = express.Router();
const controller = require("../controllers/device");
const { uploadAvatar } = require('../config/uploadAvatar');
router.get("/profile", (req, res) => {
    res.render("profile.pug");
});
router.get("/History1", controller.history1);
router.get("/History2", controller.history2);
router.get("/", controller.index);
router.post("/change-status/:TT/:id", controller.changeStatus);
router.get("/sensor-data", controller.getSensorData);
router.post('/upload-avatar', uploadAvatar);

module.exports = router;
