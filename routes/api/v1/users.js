var express = require('express');
var router = express.Router();
var request = require('request');

var User = require('../../../models/user');
var Project = require('../../../models/project');
var Collection = require('../../../models/collection');
var Item = require('../../../models/entry');

router.get('/current', function (req, res) {

    request({
        method: 'POST',
        uri: 'https://campsi.eu.auth0.com/tokeninfo',
        json: {id_token: req.user.aud}
    }, function (error, response, body) {
        console.info(body);
    });

    res.json(req.user);
});

router.get('/', function(req, res){

    res.json()
});

module.exports = router;
