var express = require('express');
var router = express.Router();

var Component = require('../../../models/component');
var mongoose = require('mongoose');

/* GET home page. */
router.get('/', function (req, res, next) {
    Component.find({/*userId: sdsg*/}, function(err, components){
        res.json(components);
    });
});

module.exports = router;
