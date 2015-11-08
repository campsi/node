var express = require('express');
var router = express.Router();

// models
var Project = require('./../models/project');
var Collection = require('./../models/collection');
var Component = require('./../models/component');
var Draft = require('./../models/draft');
var Template = require('./../models/template');

//lib
var Campsi = require('campsi');
var async = require('async');
var cheerio = require('cheerio');
var deepcopy = require('deepcopy');
var extend = require('extend');
var jade = require('jade');
var path = require('path');
var fs = require('fs');

//conf
var config = require('../config');
var browserConfig = require('../browser-config');
var panelOptions = require('./../lib/campsi-app/panels');
var routes = require('./../lib/campsi-app/routes');

//middleware
var resources = require('../middleware/resources');
resources(router);

var createPanels = function (panelsOptions, context, callback) {
    var panels = [];

    async.forEachOf(panelsOptions, function (options, id, cb) {
        Campsi.create('campsi/panel', {
            options: options,
            value: options.componentValue,
            context: context
        }, function (panel) {
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

    async.parallel(stack, function () {
        createPanels(options, request.context, function (panels) {
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

var getProjectDeployments = function (req, res, next) {
    Project.findOne({_id: req.project._id}).select('deployments').exec(function (err, project) {
        req.project.deployments = project.deployments;
        next();
    });
};
var getComponents = function (req, res, next) {
    Component.find({}, function (err, results) {
        req.components = results;
        req.context.set('components', req.components);
        next()
    });
};
var getTemplates = function (req, res, next) {
    Template.find({}).select('identifier name icon tags').exec(function (err, results) {
        req.templates = results;
        req.context.set('templates', req.templates);
        next()
    });
};

var getEntriesAndDrafts = function (req, res, next) {
    req.collection.getEntriesAndDrafts(req.user, function (err, items) {
        req.entriesAndDrafts = items;
        next();
    });
};

router.get('/editor', function (req, res) {
    res.render('editor');
});

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

router.get(routes.project.path, getProjects, getTemplates, function (req, res, next) {

    var options = getPanelOptions(routes.project.layout);
    options.projects.componentValue = req.projects;
    if (req.project) {
        options.project.componentValue = req.project.toObject();
        options.project.componentOptions = {templates: req.templates};
    }
    send([], options, req, res);
});

router.get(routes.projectUsers.path, getTemplates, function (req, res, next) {
    var options = getPanelOptions(routes.projectUsers.layout);
    if (req.project) {
        options.project.componentValue = req.project.toObject();
        options.project.componentOptions = {templates: req.templates};
        options.projectUsers.componentValue = req.project.identity();
        req.project.getUsers(function (err, users) {
            options.projectUsers.componentValue.users = users;
            send([], options, req, res);
        });
    } else {
        send([], options, req, res);
    }
});
router.get(routes.projectDeployments.path, getTemplates, getProjectDeployments, function (req, res, next) {
    var options = getPanelOptions(routes.projectDeployments.layout);
    if (req.project) {
        options.project.componentValue = req.project.toObject();
        options.project.componentOptions = {templates: req.templates};
        options.projectDeployments.componentValue = req.project.toObject();
        send([], options, req, res);
    } else {
        send([], options, req, res);
    }
});


router.get(routes.newCollection.path, getTemplates, function (req, res, next) {

    var options = getPanelOptions(routes.collection.layout);

    options.project.componentValue = req.project.toObject();
    options.project.componentOptions = {templates: req.templates};
    options.collection.componentValue = {__project: req.project.identity()};

    send([], options, req, res);
});

router.get(routes.collection.path, getTemplates, function (req, res, next) {

    var options = getPanelOptions(routes.collection.layout);

    options.project.componentValue = req.project.toObject();
    options.project.componentOptions = {templates: req.templates};
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

router.get(routes.draft.path, getEntriesAndDrafts, function (req, res, next) {
    var options = getPanelOptions(routes.entries.layout);
    options.entries.componentValue = req.entriesAndDrafts;
    options.entry.componentOptions = req.collection.toObject();
    options.entry.componentValue = req.draft.toObject();
    send([], options, req, res);
});


module.exports = router;
