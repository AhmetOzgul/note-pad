const express = require("express");
const moment = require("moment");
const Response = require("../lib/Response");
const AuditLogs = require("../db/models/AuditLogs");
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        let body = req.body;
        let query = {};

        if (body.beginDate && body.endDate) {
            query.createdAt = {
                $gte: moment(body.beginDate),
                $lte: moment(body.endDate)
            };
        } else {
            query.createdAt = {
                $gte: moment().subtract(1, 'day').startOf('day').toDate(),
                $lte: moment()
            };
        }

        let auditLogs = await AuditLogs.find(query).limit(500).skip(body.skip || 0).sort({ createdAt: -1 });
        res.json(Response.successResponse(auditLogs));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.status || 500).json(errorResponse);
    }
});

module.exports = router;
