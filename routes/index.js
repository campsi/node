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

// todo dupli ?
var defaultPanelOptions = {
    leftButtons: [{
        tag: 'a',
        attr: {href: '/', class: 'back'},
        content: 'back'
    }],
    rightButtons: [],
    title: 'Untitled Panel',
    id: '',
    classList: ['next']
};


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

var send = function (stack, options, response) {
    async.parallel(stack, function () {
        createPanels(options, function (panels) {
            response.render('index', {panels: renderPanels(panels)});
        });
    });
};

var getPanelOptions = function (layout) {
    var id;
    var options = deepcopy(panelOptions);

    for (id in options) {
        if (options.hasOwnProperty(id)) {
            options[id] = extend({}, defaultPanelOptions, options[id]);
            if (layout[id] !== undefined) {
                options[id].classList = layout[id];
            }
        }
    }
    return options;
};


router.get(routes.welcome.path, function (req, res, next) {

    console.dir(req.user);
    var options = getPanelOptions(routes.welcome.layout);

    var getProjects = function (cb) {
        ProjectService.list({}, function (results) {
            options.projects.componentValue = results;
            cb();
        });
    };

    send([getProjects], options, res);
});

router.get(routes.projects.path, function (req, res, next) {

    var options = getPanelOptions(routes.projects.layout);

    var getProjects = function (cb) {
        ProjectService.list({}, function (results) {
            options.projects.componentValue = results;
            cb();
        });
    };

    send([getProjects], options, res);
});

router.get(routes.project.path, function (req, res, next) {

    var options = getPanelOptions(routes.project.layout);

    var getProjects = function (cb) {
        ProjectService.list({}, function (results) {
            options.projects.componentValue = results;
            cb();
        });
    };
    var getProject = function (cb) {
        if (req.params.id === 'new') {
            return cb();
        }
        ProjectService.find({_id: req.params.id}, function (results) {
            options.project.componentValue = results[0];
            cb();
        });
    };

    send([getProjects, getProject], options, res);
});


router.get(routes.collection.path, function (req, res, next) {

    var options = getPanelOptions(routes.collection.layout);

    var getCollection = function (cb) {
        CollectionService.find({_id: req.params.id}, function (results) {
            options.collection.componentValue = results[0];
            cb();
        });
    };

    send([getCollection], options, res);
});

router.get(routes.entries.path, function (req, res, next) {

    var options = getPanelOptions(routes.entries.layout);

    options.entries.leftButtons[0].attr.href = '/collections/' + req.params.id;

    var getCollection = function (cb) {
        CollectionService.find({_id: req.params.id}, function (results) {
            options.entry.componentOptions = results[0];
            options.collection.componentValue = results[0];
            cb();
        });
    };
    var getEntries = function (cb) {
        CollectionService.listEntries({_collection: req.params.id}, function (entries) {
            options.entries.componentValue = {
                collectionId: req.params.id,
                entries: entries
            };
            cb();
        });
    };

    send([getCollection, getEntries], options, res);
});

router.get(routes.designer.path, function (req, res, next) {

    var options = getPanelOptions(routes.designer.layout);

    var getCollection = function (cb) {
        CollectionService.find({_id: req.params.id}, function (results) {
            options.collection.componentValue = results[0];
            options.designer.componentValue = results[0];
            cb();
        });
    };

    var getComponents = function(cb) {
        ComponentService.find({}, function(results){
            options.components.componentValue = results;
            cb();
        });
    };
    send([getCollection, getComponents], options, res);
});

router.get(routes.entry.path, function (req, res, next) {

    var options = getPanelOptions(routes.entry.layout);

    options.entries.leftButtons[0].attr.href = '/collections/' + req.params.collectionId;

    var getCollection = function (cb) {
        CollectionService.find({_id: req.params.collectionId}, function (results) {
            options.entry.componentOptions = results[0];
            options.collection.componentValue = results[0];
            cb();
        });
    };
    var getEntries = function (cb) {
        CollectionService.listEntries({_collection: req.params.collectionId}, function (entries) {
            options.entries.componentValue = {
                collectionId: req.params.collectionId,
                entries: entries
            };
            cb();
        });
    };
    var getEntry = function (cb) {
        CollectionService.findEntry({
            _collection: req.params.collectionId,
            _id: req.params.entryId
        }, function (entries) {
            options.entry.componentValue = entries[0];
            cb();
        });
    };
    send([getCollection, getEntries, getEntry], options, res);
});


module.exports = router;
