'use strict';

var express = require('express');
var router = express.Router();
var config = require('../../config');
var request = require('request');

router.post('/user-access-token', function (req, res) {

    request({
        uri: 'https://graph.facebook.com/v2.6/oauth/access_token',
        qs: {
            grant_type: 'fb_exchange_token',
            client_id: config.facebook.client_id,
            client_secret: config.facebook.client_secret,
            fb_exchange_token: req.body.access_token
        }
    }, function (err, response, body) {
        res.json(JSON.parse(body));
    });

});

module.exports = router;