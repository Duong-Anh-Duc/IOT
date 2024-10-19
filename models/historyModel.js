const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    day : {
        type : String,
    },
    hour : {
        type : String
    }
},
{
    timestamps : true
}
);

const History = mongoose.model("History", HistorySchema, "history");

module.exports = History;
