var router = require('express').Router();
var resources = require('../../../middleware/resources');
var Project = require('../../../models/project');
var Entry = require('../../../models/entry');
var handlebars = require('handlebars');

resources(router);

router.get('/projects/', function (req, res, next) {
    Project.list(req.user, function (err, projects) {
        res.json(projects.map(function (p) {
            return p.toObject()
        }));
    });
});
router.get('/projects/:project', function (req, res, next) {
    res.json(req.project.toObject());
});

router.get('/projects/:project/collections/:collection', function (req, res, next) {
    res.json(req.collection.toObject());
});

router.get('/projects/:project/collections/:collection/entries', function (req, res, next) {

    var templates = {};
    req.collection.templates.map(function (template) {
        templates[template.identifier] = template.markup
    });

    Entry.find({_collection: req.collection._id}, function (err, entries) {
        if (req.query.template && templates[req.query.template]) {
            var template = handlebars.compile(templates[req.query.template]);
            res.send(template({entries: entries}));
        } else {
            res.json(entries);
        }
    });
});

router.get('/projects/:project/collections/:collection/entries/:entry', function (req, res, next) {
    res.json(req.entry.toObject());
});

module.exports = router;
