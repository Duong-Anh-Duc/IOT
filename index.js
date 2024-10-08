const express = require("express");
const methodOverride = require("method-override");

const app = express();
const port = 3000;
const {subscribeToTopic} = require("./services/mqttService")
//subscribeToTopic("home/sensor")
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
