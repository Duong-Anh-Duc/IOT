const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema({
    stt: {
        type: Number,
    },
    name: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    }
});

const Device = mongoose.model("Device", DeviceSchema, "device");

module.exports = Device;
