'use strict';
var express = require('express');
var router = express.Router();
var request = require('request');

router.use('/ajax-proxy', function (req, res) {
    request({url: req.query.url}, function (error, response, body) {
        if (!error) {
            return res.send(body);
        }
        return res.status(500).json({error: error})
    });
});

module.exports = router;