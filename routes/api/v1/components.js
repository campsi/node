var express = require('express');
var router = express.Router();

var Component = require('../../../models/component');

/* GET home page. */
router.get('/', function (req, res) {
    Component.find({/*userId: sdsg*/}, function(err, components){
        res.json(components);
    });
});

module.exports = router;
