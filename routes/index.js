var express = require('express');
var router = express.Router();


//lib
var Campsi = require('campsi-core');
var async = require('async');
var cheerio = require('cheerio');
var deepcopy = require('deepcopy');
var jade = require('jade');
var path = require('path');
var fs = require('fs');

//conf
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
            context: context
        }, function (panel) {
            panels.push(panel);
            panel.setSavedValue(options.componentValue, cb);
        });
    }, function () {
        callback(panels);
    });
};


var getLanding = function (req, res, next) {
    //var filename = path.join(__dirname, '/../public/panels/welcome.html');
    //fs.readFile(filename, function (err, data) {
    //    req.welcome = data;
    //    next();
    //});
    next();
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

var createOptions = function (layout) {

    var docsToObj = function (arr) {
        var ret = [];
        arr.forEach(function (item) {
            ret.push(item.toObject());
        });
        return ret;
    };


    return function (req, res, next) {

        req.context.setLocale(req.locale);

        var options = getPanelOptions(layout, req.context);

        if (req.welcome) {
            options.welcome.componentValue = req.welcome;
        }

        if (req.user) {
            options.dashboard.componentValue = {};
            options.dashboard.componentValue.user = req.user.toObject();
            if (req.projects) {
                options.dashboard.componentValue.projects = docsToObj(req.projects);
            }
        }

        if (req.projects) {
            options.projects.componentValue = docsToObj(req.projects);
        }

        if (req.project) {
            var projectObj = req.project.toObject();
            projectObj.collections.forEach(function (collection) {
                delete collection['id'];
            });
            options.project.componentValue = projectObj;
        } else {
            options.project.additionalClasses = ['new'];
            options.project.componentValue = {};
        }

        if (req.templates) {
            options.project.componentOptions = {templates: docsToObj(req.templates)};
        }

        if (req.projectUsers) {
            options.projectUsers.componentValue = req.project.identity();
            options.projectUsers.componentValue.users = req.projectUsers;
        }

        if (req.projectDeployments) {
            options.projectDeployments.componentValue = req.project.identity();
            options.projectDeployments.componentValue.deployments = docsToObj(req.projectDeployments);
        }

        if (req.collection) {
            var collectionObj = req.collection.toObject();
            options.collection.componentValue = collectionObj;
            options.entry.componentOptions = collectionObj;
            if (req.params.fieldName) {

                options.collection.componentOptions = {
                    hightlightedField: req.params.fieldName
                };

                options.fieldProperties.componentValue = {
                    fieldName: req.params.fieldName,
                    collection: collectionObj
                };
            }
        } else {
            options.collection.additionalClasses = ['new'];
        }

        if (req.entriesAndDrafts) {
            options.entries.componentValue = {
                entries: docsToObj(req.entriesAndDrafts.entries),
                drafts: docsToObj(req.entriesAndDrafts.drafts)
            };
        }

        if (req.entry) {
            options.entry.componentValue = req.entry.toObject();
        }

        if (req.draft) {
            options.entry.componentValue = req.draft.toObject();
        }

        if (req.components) {
            options.components.componentValue = docsToObj(req.components);
        }

        req.panelsOptions = options;

        next();

    }
};

var redirectToDashboardIfLoggedIn = function (req, res, next) {
    //return (req.user) ? res.redirect('/dashboard') : next();
    return next();
};

router.get(routes.welcome.path, redirectToDashboardIfLoggedIn, getLanding, resources.getProjects, createOptions(routes.welcome.layout));
router.get(routes.dashboard.path, resources.getProjects, createOptions(routes.dashboard.layout));
router.get(routes.projects.path, resources.getProjects, createOptions(routes.projects.layout));
router.get(routes.project.path, resources.getProjects, resources.getTemplates, createOptions(routes.project.layout));
router.get(routes.projectUsers.path, resources.getTemplates, resources.getProjectUsers, createOptions(routes.projectUsers.layout));
router.get(routes.projectDeployments.path, resources.getTemplates, resources.getProjectDeployments, createOptions(routes.projectDeployments.layout));
router.get(routes.billing.path, createOptions(routes.billing.layout));
router.get(routes.collection.path, resources.getComponents, createOptions(routes.collection.layout));
router.get(routes.collectionFieldProperties.path, createOptions(routes.collectionFieldProperties.layout));
router.get(routes.entries.path, resources.getEntriesAndDrafts, createOptions(routes.entries.layout));
router.get(routes.newEntry.path, resources.getEntriesAndDrafts, createOptions(routes.newEntry.layout));
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
