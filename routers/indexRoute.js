const express = require('express');
const router = express.Router();
const controller = require("../controllers/device");
const mqttController = require("../controllers/mqttController")
router.get("/profile", (req, res) => {
    res.render("profile.pug");
});

router.get("/History1", controller.history1);
router.get("/History2", controller.history2);
router.get("/", controller.index);
router.post("/change-status/:TT/:id", controller.changeStatus);

module.exports = router;
