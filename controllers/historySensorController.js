const Weather = require("../models/weatherModel");
const paginationRangeHelper = require("../helpers/paginationRange");

module.exports.weatherData = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let sortColumn = req.query.sortColumn || null;
    let sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    let temperature = req.query.temperature ? parseFloat(req.query.temperature) : null;
    let humidity = req.query.humidity ? parseFloat(req.query.humidity) : null;
    let light = req.query.light ? parseFloat(req.query.light) : null;
    let windSpeed = req.query.windSpeed ? parseFloat(req.query.windSpeed) : null;
    let dateFilter = req.query.dateTimeFilter ? req.query.dateTimeFilter.split(' ')[0] : null;
    let timeFilter = req.query.dateTimeFilter ? req.query.dateTimeFilter.split(' ')[1] : null;

    let skip = (page - 1) * limit;
    let query = {};

    // Thêm điều kiện lọc nếu có
    if (temperature !== null) {
        query.temperature = temperature; 
    }

    if (humidity !== null) {
        query.humidity = humidity; 
    }

    if (light !== null) {
        query.light = light; 
    }

    if (windSpeed !== null) {
        query.windSpeed = windSpeed;
    }

    if (dateFilter) {
        query.day = { $regex: new RegExp(`^${dateFilter}`) };
    }

    if (timeFilter) {
        query.hour = { $regex: new RegExp(`^${timeFilter}`) };
    }

    // Thêm điều kiện sắp xếp nếu có
    let sortOptions = {};
    if (sortColumn) {
        sortOptions[sortColumn] = sortOrder;
    }
    try {
        // Đếm tổng số bản ghi phù hợp với query
        let totalRecords = await Weather.countDocuments(query);

        // Tìm các bản ghi phù hợp với query, sắp xếp và phân trang
        let records = await Weather.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalRecords / limit);

        res.json({
            success: true,
            records: records,
            currentPage: page,
            totalPages: totalPages,
            limit: limit,
            sortColumn: sortColumn,
            sortOrder: sortOrder,
            temperature: temperature,
            humidity: humidity,
            light: light,
            dateFilter: dateFilter,
            timeFilter: timeFilter
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching weather data",
            error: error.message
        });
    }
};



module.exports.weatherPage = (req, res) => {
    res.render("../views/history2.pug");
};
module.exports.weatherPage2 = (req, res) => {
    res.render("../views/history3.pug");
};

