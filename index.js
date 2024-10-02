const express = require("express");
const methodOverride = require("method-override");
const app = express();
const port = 3000;

// Middleware
app.use(methodOverride('_method'));
app.use(express.static('public'));

// Cài đặt view engine
app.set('views', './views');
app.set('view engine', "pug");

// Kết nối đến database
const database = require("./config/database");
database.connect();

// Sử dụng routes
const routes = require('./routers/indexRoute');
app.use(routes);

// Khởi chạy server
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
