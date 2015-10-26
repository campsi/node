var router = require('express').Router();
var resources = require('../../../middleware/resources');
var Project = require('../../../models/project');
var Entry = require('../../../models/entry');
var Draft = require('../../../models/draft');
var handlebars = require('handlebars');
var extend = require('extend');

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

router.get('/projects/:project/users', function (req, res, next) {
    req.project.getUsers(function (err, users) {
        res.json(users);
    })
});

router.get('/projects/:project/guests', function (req, res, next) {
    req.project.getGuests(function (err, guests) {
        res.json(guests);
    })
});

router.get('/projects/:project/collections/:collection', function (req, res, next) {
    res.json(req.collection.toObject());
});

router.get('/projects/:project/collections/:collection/entries-and-drafts', function (req, res, next) {
    if (typeof req.user === 'undefined') {
        return res.json(req.collection.entries);
    }

    req.collection.getEntriesAndDrafts(req.user, function (err, items) {
        res.json(items.map(function (i) {
            return i.toObject();
        }));
    });
});

router.get('/projects/:project/collections/:collection/entries', function (req, res, next) {

    var templates = {};
    req.collection.templates.map(function (template) {
        templates[template.identifier] = template.markup
    });

    var query = extend({}, req.query, {_collection: req.collection._id});
    delete query['template'];

    Entry.find(query).select('data').exec(function (err, entries) {
        if (req.query.template && templates[req.query.template]) {
            var template = handlebars.compile(templates[req.query.template]);
            res.send(template({entries: entries}));
        } else {
            res.json(entries);
        }
    });
});


router.get('/projects/:project/collections/:collection/drafts', function (req, res, next) {
    Draft.findDraftsInCollectionForUser(req.collection, req.user, function (err, drafts) {
        res.json(drafts);
    })
});

router.get('/projects/:project/collections/:collection/entries/:entry', function (req, res, next) {
    res.json(req.entry.toObject());
});


router.get('/projects/:project/collections/:collection/drafts/:draft', function (req, res, next) {
    res.json(req.draft.toObject());
});

module.exports = router;
