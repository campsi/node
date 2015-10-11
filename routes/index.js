var express = require('express');
var router = express.Router();
var Project = require('./../models/project');
var Campsi = require('campsi');
var async = require('async');
var cheerio = require('cheerio');
var deepcopy = require('deepcopy');
var extend = require('extend');
var panelOptions = require('./../lib/components/campsi/app/panels');
var routes = require('./../lib/components/campsi/app/routes');
//todo uniformiser les singuliers /pluriels
var ProjectService = require('./../services/project');
var CollectionService = require('./../services/collections');
var ComponentService = require('./../services/components');
var jade = require('jade');
var resources = require('../middleware/resources');

resources(router);

var createPanels = function (panelsOptions, callback) {
    var panels = [];
    async.forEachOf(panelsOptions, function (options, id, cb) {
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

    options._data = {
        project: request.project,
        collection: request.collection,
        entry: request.entry
    };

    async.parallel(stack, function () {
        createPanels(options, function (panels) {
            response.render('index', {panels: renderPanels(panels), user: request.user});
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


router.get(routes.welcome.path, function (req, res, next) {

    var options = getPanelOptions(routes.welcome.layout);

    var getProjects = function (cb) {
        ProjectService.list({}, function (results) {
            options.projects.componentValue = results;
            cb();
        });
    };

    send([getProjects], options, req, res);
});

router.get(routes.projects.path, function (req, res, next) {

    var options = getPanelOptions(routes.projects.layout);

    var getProjects = function (cb) {
        ProjectService.list({}, function (results) {
            options.projects.componentValue = results;
            cb();
        });
    };

    send([getProjects], options, req, res);
});

router.get(routes.project.path, function (req, res, next) {

    var options = getPanelOptions(routes.project.layout);

    var getProjects = function (cb) {
        ProjectService.list({}, function (results) {
            options.projects.componentValue = results;
            cb();
        });
    };

    options.project.componentValue = req.project.toObject();

    send([getProjects], options, req, res);
});


router.get(routes.collection.path, function (req, res, next) {

    var options = getPanelOptions(routes.collection.layout);

    options.project.componentValue = req.project.toObject();
    options.collection.componentValue = req.collection.toObject();

    send([], options, req, res);
});

router.get(routes.designer.path, function (req, res, next) {
    var options = getPanelOptions(routes.designer.layout);
    options.collection.componentValue = req.collection.toObject();
    options.designer.componentValue = req.collection.toObject();

    var getComponents = function (cb) {
        ComponentService.find({}, function (results) {
            options.components.componentValue = results;
            cb();
        });
    };
    send([getComponents], options, req, res);
});

var getEntries = function (options) {

    return function (req, res, next) {

        var getEntryTemplate = function (collection) {
            if (typeof collection.templates === 'undefined') {
                return;
            }

            var template;

            collection.templates.forEach(function (t) {
                if (t.identifier === 'entry') template = t;
            });
            return template;
        };

        var collection = req.collection.toObject();
        var project = req.project.toObject();
        var template = getEntryTemplate(collection);

        options.entries.componentValue = collection;
        options.entry.componentOptions = collection;
        options.collection.componentValue = collection;

        if (typeof template !== 'undefined') {
            if (typeof options.entries.componentOptions === 'undefined') {
                options.entries.componentOptions = {};
            }
            options.entries.componentOptions.template = template.markup;
        }

        options.project.componentValue = project;
        req.options = options;
        next();
    }
};

router.get(routes.entries.path, getEntries(getPanelOptions(routes.entries.layout)), function (req, res, next) {
    send([], req.options, req, res);
});

router.get(routes.entry.path, getEntries(getPanelOptions(routes.entry.layout)), function (req, res, next) {
    req.options.entry.componentValue = req.entry;
    req.options.entries.componentValue.selectedEntry = req.entry._id;
    send([], req.options, req, res);
});


module.exports = router;
