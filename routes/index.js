var express = require('express');
var router = express.Router();
var Project = require('./../models/project');
var Campsi = require('campsi');
var async = require('async');
var cheerio = require('cheerio');
var deepcopy = require('deepcopy');
var defaultPanelOptions = require('./../lib/components/campsi/app/panels');
var ProjectService = require('./../services/project');

var getPanelById = function (panels, id) {
    var panel;
    panels.forEach(function (p) {
        if (p.options.id === id) panel = p;
    });
    return panel;
};

var createPanels = function (panelsOptions, callback) {
    var panels = [];
    async.forEachOf(panelsOptions, function (options, id, cb) {
        Campsi.create('campsi/panel', options, undefined, function (panel) {
            panels.push(panel);
            cb();
        });
    }, function () {
        callback(panels);
    });
};

var renderPanels = function (panels) {
    return panels.map(function (panel) {
        return cheerio.html(panel.render());
    });
};

/* GET home page. */
router.get('/', function (req, res, next) {

    var panelOptions = deepcopy(defaultPanelOptions);


    createPanels(panelOptions, function (panels) {

        Project.find({}, function (err, projects) {

            var projectObjects = projects.map(function (project) {
                return project.toObject();
            });

            getPanelById(panels, 'projects').setValue(projectObjects, function () {
                res.render('index', {panels: renderPanels(panels)});
            });
        });

    });
});

router.get('/projects/:id', function (req, res, next) {
    var options = deepcopy(defaultPanelOptions);

    options.welcome.classList = ['prev'];
    options.projects.classList = ['active w50'];
    options.project.classList = ['active w50 l50'];

    var getProjects = function (cb) {
        ProjectService.list({}, function(results){
            options.projects.componentValue = results;
            cb();
        });
    };
    var getProject = function (cb) {
        ProjectService.find({_id: req.params.id}, function(results){
            options.project.componentValue = results[0];
            cb();
        });
    };

    async.parallel([
        getProjects,
        getProject
    ], function () {
        createPanels(options, function (panels) {
            res.render('index', {panels: renderPanels(panels)});
        });
    });


});
module.exports = router;
