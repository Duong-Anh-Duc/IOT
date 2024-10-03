const mongoose = require("mongoose")
const WeatherSchema = new mongoose.Schema({
    temperature: {
        type: Number,   
        required: true  
    },
    humidity: {
        type: Number,   
        required: true  
    },
    light: {
        type: Number,  
        required: true  
    },
    time : {
        type : Date,
        default : Date.now
    }
})

const Weather = mongoose.model("Weather", WeatherSchema, "weather")
module.exports = Weather