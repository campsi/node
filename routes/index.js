var express = require('express');
var router = express.Router();
var Project = require('./../models/project');

console.info(Project);

/* GET home page. */
router.get('/', function (req, res, next) {
    var viewData = {};

    Project.find({}, function (err, projects) {
        console.info(projects);
        viewData.projects = projects;
        res.render('index', viewData);
    });
});


router.get('/', function(req, res, next){


});
module.exports = router;
