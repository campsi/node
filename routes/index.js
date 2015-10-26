var express = require('express');
var router = express.Router();
var Project = require('./../models/project');
var Collection = require('./../models/collection');
var Component = require('./../models/component');
var Draft = require('./../models/draft');
var Campsi = require('campsi');
var async = require('async');
var cheerio = require('cheerio');
var deepcopy = require('deepcopy');
var extend = require('extend');
var panelOptions = require('./../lib/campsi-app/panels');
var routes = require('./../lib/campsi-app/routes');
var jade = require('jade');
var resources = require('../middleware/resources');
var config = require('../config');
var browserConfig = require('../browser-config');
var path = require('path');
var fs = require('fs');
resources(router);

var createPanels = function (panelsOptions, callback) {
    var panels = [];

    async.forEachOf(panelsOptions, function (options, id, cb) {
        if (id === 'context') {
            return cb();
        }
        options.context = panelsOptions.context;
        Campsi.create('campsi/panel', options, options.componentValue, function (panel) {
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

var send = function (stack, options, request, response) {

    options.context = request.context;

    async.parallel(stack, function () {
        createPanels(options, function (panels) {
            response.render('index', {
                panels: renderPanels(panels),
                user: request.user,
                config: browserConfig,
                context: request.context
            });
        });
    });
};

var getPanelOptions = function (layout) {
    var id;
    var currentPanelOptions = {};
    for (id in panelOptions) {
        if (panelOptions.hasOwnProperty(id)) {
            currentPanelOptions[id] = deepcopy(panelOptions[id]);
            if (layout[id] !== undefined) {
                currentPanelOptions[id].classList = layout[id];
            }
        }
    }
    return currentPanelOptions;
};

var getProjects = function (req, res, next) {
    Project.list(req.user, function (err, results) {
        req.projects = results;
        next();
    });
};
var getComponents = function (req, res, next) {
    Component.find({}, function (err, results) {
        req.components = results;
        next()
    });

};

var getEntriesAndDrafts = function(req, res, next){
    req.collection.getEntriesAndDrafts(req.user, function(err, items){
        req.entriesAndDrafts = items;
        next();
    });
};

router.get(routes.welcome.path, getProjects, function (req, res, next) {
    var options = getPanelOptions(routes.welcome.layout);
    var filename = path.join(__dirname, '/../public/panels/' + options.welcome.contentFile);
    fs.readFile(filename, function (err, data) {
        options.welcome.content = data;
        options.projects.componentValue = req.projects;
        send([], options, req, res);
    });
});

router.get(routes.projects.path, getProjects, function (req, res, next) {

    var options = getPanelOptions(routes.projects.layout);
    options.projects.componentValue = req.projects;
    send([], options, req, res);
});

router.get(routes.project.path, getProjects, function (req, res, next) {

    var options = getPanelOptions(routes.project.layout);
    options.projects.componentValue = req.projects;
    if (req.project) {
        options.project.componentValue = req.project.toObject();
    }
    send([], options, req, res);
});
router.get(routes.projectUsers.path, function (req, res, next) {

    var options = getPanelOptions(routes.projectUsers.layout);
    if (req.project) {
        options.project.componentValue = req.project.toObject();
        options.projectUsers.componentValue = req.project.identity();
        req.project.getUsers(function (err, users) {
            options.projectUsers.componentValue.users = users;
            send([], options, req, res);
        });
    } else {
        send([], options, req, res);
    }
});


router.get(routes.newCollection.path, function (req, res, next) {

    var options = getPanelOptions(routes.collection.layout);

    options.project.componentValue = req.project.toObject();
    options.collection.componentValue = {__project: req.project.identity()};

    send([], options, req, res);
});

router.get(routes.collection.path, function (req, res, next) {

    var options = getPanelOptions(routes.collection.layout);

    options.project.componentValue = req.project.toObject();
    options.collection.componentValue = req.collection.toObject();

    send([], options, req, res);
});

router.get(routes.designer.path, getComponents, function (req, res, next) {
    var options = getPanelOptions(routes.designer.layout);
    options.collection.componentValue = req.collection.toObject();
    options.designer.componentValue = req.collection.toObject();
    options.components.componentValue = req.components;

    send([], options, req, res);
});

router.get(routes.entries.path, getEntriesAndDrafts, function (req, res, next) {

    var options = getPanelOptions(routes.entries.layout);
    options.entries.componentValue = req.entriesAndDrafts;
    options.entry.componentOptions = req.collection;
    send([], options, req, res);
});

router.get(routes.entry.path, getEntriesAndDrafts, function (req, res, next) {
    var options = getPanelOptions(routes.entries.layout);
    options.entries.componentValue = req.entriesAndDrafts;
    options.entry.componentOptions = req.collection.toObject();
    options.entry.componentValue = req.entry.toObject();
    send([], options, req, res);
});

router.get(routes.draft.path,  getEntriesAndDrafts, function (req, res, next) {
    var options = getPanelOptions(routes.entries.layout);
    options.entries.componentValue = req.entriesAndDrafts;
    options.entry.componentOptions = req.collection.toObject();
    options.entry.componentValue = req.draft.toObject();
    send([], options, req, res);
});


module.exports = router;
