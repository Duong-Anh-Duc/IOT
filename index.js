const express = require("express");
const methodOverride = require("method-override");
require("dotenv").config()
const app = express();
const port = 3000;
const {subscribeToTopic} = require("./services/mqttService")
//subscribeToTopic("home/sensor")
app.use(express.json())
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.set('views', './views');
app.set('view engine', "pug");
const database = require("./config/database");
database.connect();
const routes = require('./routers/indexRoute');
app.use(routes);
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

//  temperature
// humidity
// light
const deviceModel = require("./models/deviceModel");
const historyModel = require("./models/historyModel");
const weatherModel = require("./models/weatherModel");
// async function getDistinctTemperatures() {
//     try {
//       const data = await weatherModel.find({}).sort({temperature : -1})
//       console.log(data);  // In ra mảng các giá trị temperature duy nhất
//     } catch (err) {
//       console.error(err);  // In ra lỗi nếu có
//     }
//   }
  
//   getDistinctTemperatures();