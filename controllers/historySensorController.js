const Weather = require("../models/weatherModel");
const paginationRangeHelper = require("../helpers/paginationRange");
module.exports.weatherData = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let sortField = req.query.sortField || 'none';
    let sortOrder = req.query.sortOrder || 'asc';
    let dateFilter = req.query.dateFilter;
    let timeFilter = req.query.timeFilter || '00:00:00';

    let skip = (page - 1) * limit;
    let query = {};

    if (dateFilter) {
        let startDateTime = new Date(`${dateFilter}T${timeFilter}`);
        let endDateTime = new Date(startDateTime);
        endDateTime.setSeconds(endDateTime.getSeconds() + 1);

        query.createdAt = { $gte: startDateTime, $lt: endDateTime }; 
    }

    try {
        let totalRecords = await Weather.countDocuments(query);

        let sortQuery = {};
        if (sortField !== 'none') {
            sortQuery[sortField] = sortOrder === 'asc' ? 1 : -1;
        }

        let records = await Weather.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalRecords / limit);
        const pagination = paginationRangeHelper.paginationRange(page, totalPages);

        res.json({
            success: true,
            records: records,
            currentPage: page,
            totalPages: totalPages,
            pagination: pagination,
            limit: limit,
            sortField: sortField,
            sortOrder: sortOrder,
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
}
module.exports.weatherPage = (req, res) => {
    res.render("../views/history2.pug");
};
