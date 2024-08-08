const express = require('express');
const router = express.Router();

router.get("/get-notes", (req, res, next) => {
    res.json({
        id: req.body.id,
        params: req.params,
        query: req.query,
        headers: req.headers
    });
});

module.exports = router;