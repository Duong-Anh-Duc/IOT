const History = require("../models/historyModel");
const paginationRangeHelper = require("../helpers/paginationRange");
module.exports.deviceData = async (req, res) => {
    let deviceFilter = req.query.deviceFilter || 'all';
    let statusFilter = req.query.statusFilter || 'all';
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let sortColumn = req.query.sortColumn || 'createdAt';
    let sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    let dateFilter = req.query.dateTimeFilter ? req.query.dateTimeFilter.split(' ')[0] : null;
    let timeFilter = req.query.dateTimeFilter ? req.query.dateTimeFilter.split(' ')[1] : null;

    let skip = (page - 1) * limit;
    let query = {};

    if (deviceFilter !== 'all') {
        query.name = deviceFilter;
    }

    if (statusFilter !== 'all') {
        query.status = statusFilter;
    }

    if (dateFilter) {
        query.day = { $regex: new RegExp(`^${dateFilter}`) };
    }

    if (timeFilter) {
        query.hour = { $regex: new RegExp(`^${timeFilter}`) };
    }

    let sortOptions = {};
    if (sortColumn) {
        sortOptions[sortColumn] = sortOrder;
    }

    try {
        let totalRecords = await History.countDocuments(query);

        let data = await History.find(query)
                                .sort(sortOptions)
                                .skip(skip)
                                .limit(limit);

        const totalPages = Math.ceil(totalRecords / limit);

        res.status(200).json({
            success: true,
            data: data,
            currentPage: page,
            totalPages: totalPages,
            limit: limit,
            deviceFilter: deviceFilter,
            statusFilter: statusFilter,
            dateTimeFilter: req.query.dateTimeFilter 
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching history data",
            error: error.message
        });
    }
};




module.exports.devicePage = (req, res) => {
    res.render("../views/history1.pug");
};
