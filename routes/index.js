var express = require('express');
var router = express.Router();


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
var translations = require('./../lib/campsi-app/translations');

//middleware
var resources = require('../middleware/resources');
resources.patchRouter(router);


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


var getLanding= function (req, res, next) {
    var filename = path.join(__dirname, '/../public/panels/welcome.html');
    fs.readFile(filename, function (err, data) {
        req.welcome = data;
        next();
    });
};


var renderPanels = function (panels) {
    return panels.map(function (panel) {
        return cheerio.html(panel.render());
    });
};

var getPanelOptions = function (layout, ctx) {
    var id;
    var currentPanelOptions = {};
    var localizedPanelOptions = panelOptions(ctx);
    for (id in localizedPanelOptions) {
        if (localizedPanelOptions.hasOwnProperty(id)) {
            currentPanelOptions[id] = deepcopy(localizedPanelOptions[id]);
            if (layout[id] !== undefined) {
                currentPanelOptions[id].classList = layout[id];
            }
        }
    }
    return currentPanelOptions;
};


router.get('/editor', function (req, res) {
    res.render('editor', {
        user: req.user,
        config: browserConfig,
        context: req.context
    });
});


var createOptions = function (layout) {

    var toObj = function (arr) {
        return arr.map(function (item) {
            return item.toObject();
        })
    };


    return function (req, res, next) {

        req.context.setLocale(req.locale);

        var options = getPanelOptions(layout, req.context);

        if (req.welcome)
            options.welcome.componentValue = req.welcome;

        if (req.projects)
            options.projects.componentValue = toObj(req.projects);

        if (req.project){
            var projectObj = req.project.toObject();
            projectObj.collections.forEach(function(collection){
                delete collection['id'];
            });
            options.project.componentValue = projectObj;
        }
        if (req.templates)
            options.project.componentOptions = {templates: toObj(req.templates)};

        if (req.projectUsers) {
            options.projectUsers.componentValue = req.project.identity();
            options.projectUsers.componentValue.users = req.projectUsers;
        }

        if (req.projectDeployments) {
            options.projectDeployments.componentValue = req.project.identity();
            options.projectDeployments.componentValue.deployments = toObj(req.projectDeployments);
        }

        if (req.collection) {
            var collectionObj = req.collection.toObject();
            options.collection.componentValue = collectionObj;
            options.designer.componentValue = collectionObj;
            options.entry.componentOptions = collectionObj;
        }

        if (req.entriesAndDrafts) {
            options.entries.componentValue = {
                entries: toObj(req.entriesAndDrafts.entries),
                drafts: toObj(req.entriesAndDrafts.drafts)
            };
        }

        if (req.entry) {
            options.entry.componentValue = req.entry.toObject();
        }

        if (req.draft) {
            options.entry.componentValue = req.draft.toObject();
        }

        if (req.components) {
            options.components.componentValue = toObj(req.components);
        }

        req.panelsOptions = options;
        next();

    }
};

router.get(routes.welcome.path, getLanding, resources.getProjects, createOptions(routes.welcome.layout));
router.get(routes.projects.path, resources.getProjects, createOptions(routes.projects.layout));
router.get(routes.project.path, resources.getProjects, resources.getTemplates, createOptions(routes.project.layout));
router.get(routes.projectUsers.path, resources.getTemplates, resources.getProjectUsers, createOptions(routes.projectUsers.layout));
router.get(routes.projectDeployments.path, resources.getTemplates, resources.getProjectDeployments, createOptions(routes.projectDeployments.layout));
router.get(routes.newCollection.path, resources.getTemplates, createOptions(routes.newCollection.path));
router.get(routes.collection.path, resources.getTemplates, createOptions(routes.collection.layout));
router.get(routes.designer.path, resources.getComponents, createOptions(routes.designer.layout));
router.get(routes.entries.path, resources.getEntriesAndDrafts, createOptions(routes.entries.layout));
router.get(routes.newEntry.path, resources.getEntriesAndDrafts, createOptions(routes.entries.layout));
router.get(routes.entry.path, resources.getEntriesAndDrafts, createOptions(routes.entry.layout));
router.get(routes.draft.path, resources.getEntriesAndDrafts, createOptions(routes.draft.layout));

router.get('*', function (req, res) {
    createPanels(req.panelsOptions, req.context, function (panels) {
        res.render('index', {
            panels: renderPanels(panels),
            user: req.user,
            config: browserConfig,
            context: req.context,
            translations: translations[req.locale]
        });
    });
});

module.exports = router;
