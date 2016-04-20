'use strict';
var router = require('express').Router();
router.use('*', function (req, res, next) {
    if (req.method === 'GET' || typeof req.user !== 'undefined') {
        return next();
    }
    res.status(403).json({
        error: true,
        message: 'unauthorized'
    });
});
module.exports = router;