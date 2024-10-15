const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema({
    Id: {
        type: Number,
    },
    Name: {
        type: String,
        required: true,
    },
    TT: {
        type: String,
        required: true,
    }
});

const Device = mongoose.model("Device", DeviceSchema, "device");

module.exports = Device;
