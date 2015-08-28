var express = require('express');
var router  = express.Router();
var Project = require('./../models/project');

console.info(Project);

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

module.exports = router;
