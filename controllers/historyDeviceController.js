const History = require("../models/historyModel");
const Weather = require("../models/weatherModel");
const paginationRangeHelper = require("../helpers/paginationRange");

module.exports.deviceData = async (req, res) => {
    let filter = req.query.deviceFilter || 'all';
    let statusFilter = req.query.statusFilter || 'all';
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let sortOrder = req.query.sortOrder || 'asc';
    let dateFilter = req.query.dateFilter;
    let timeFilter = req.query.timeFilter || '00:00:00'; 
    let skip = (page - 1) * limit;
    let query = {};
    if (filter !== 'all') {
        query.Name = filter;
    }

    if (statusFilter !== 'all') {
        query.TT = statusFilter;
    }
    if (dateFilter) {
        let startDateTime = new Date(`${dateFilter}T${timeFilter}`);
        let endDateTime;
        if (timeFilter === '00:00:00') {
            endDateTime = new Date(startDateTime);
            endDateTime.setHours(23, 59, 59, 999);
        } else {
            endDateTime = new Date(startDateTime);
            endDateTime.setSeconds(59, 999); 
        }

        query.createdAt = { $gte: startDateTime, $lte: endDateTime };
    }

    try {
        let totalRecords = await History.countDocuments(query);
        
        let data = await History.find(query)
                                .sort({ createdAt: sortOrder === 'asc' ? 1 : -1 })
                                .skip(skip)
                                .limit(limit);

        const totalPages = Math.ceil(totalRecords / limit);
        const pagination = paginationRangeHelper.paginationRange(page, totalPages);

        res.status(200).json({
            success: true,
            data: data,
            currentPage: page,
            totalPages: totalPages,
            pagination: pagination,
            limit: limit,
            sortOrder: sortOrder,
            deviceFilter: filter,
            statusFilter: statusFilter,
            dateFilter: dateFilter,
            timeFilter: timeFilter 
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
