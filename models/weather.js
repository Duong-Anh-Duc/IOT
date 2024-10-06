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
    Day : {
        type : String
    },
    Hour : {
        type : String
    }
    
},
{
    timestamps : true
}
)

const Weather = mongoose.model("Weather", WeatherSchema, "weather")
module.exports = Weather