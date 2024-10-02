const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    TT: {
        type: String,
        required: true,
    },
    Day : {
        type : String,
    },
    Hour : {
        type : String
    }
},
{
    timestamps : true
}
);

const History = mongoose.model("History", HistorySchema, "history");

module.exports = History;
