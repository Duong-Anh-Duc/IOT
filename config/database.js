const mongoose= require("mongoose");
module.exports.connect = async() => {
    try{
        await mongoose.connect("mongodb://localhost:27017/IOT");
        console.log("Connect Success!");

    } catch(error){
        console.log("Connect Error!");

    }
}