var router = require('express').Router();
var resources = require('../../../middleware/resources');
var Project = require('../../../models/project');
var Entry = require('../../../models/entry');
var Event = require('../../../models/event');
var Draft = require('../../../models/draft');
var Template = require('../../../models/template');
var extend = require('extend');
var docsToObject = require('../../../lib/campsi-app/server/docToObject');

resources.patchRouter(router);

router.get('/projects/', function (req, res) {
    Project.list(req.user, function (err, projects) {
        res.json(docsToObject(projects));
    });
});
router.get('/projects/:project', function (req, res) {
    res.json(docsToObject(req.project));
});

router.get('/projects/:project/users', function (req, res) {
    req.project.getUsersAndGuests(function (err, usersAndGuests) {
        res.json(usersAndGuests);
    })
});

router.get('/projects/:project/collections/:collection', function (req, res) {
    res.json(docsToObject(req.collection));
});

router.get('/projects/:project/collections/:collection/entries-and-drafts', function (req, res) {
    req.collection.getEntriesAndDrafts(req.user, function (err, entriesAndDrafts) {
        res.json(docsToObject(entriesAndDrafts));
    });
});

router.get('/projects/:project/collections/:collection/entries', function (req, res) {

    var templates = {};
    req.collection.templates.map(function (template) {
        templates[template.identifier] = template.markup
    });

    var queryParameters = {};

    var param;
    for (param in req.query) {
        if (req.query.hasOwnProperty(param) && param.indexOf('data.') === 0) {
            queryParameters[param] = req.query[param];
        }
    }

    var params = extend({}, queryParameters, {_collection: req.collection._id});
    var query = Entry.find(params).select('data');

    if (req.query.sort) {
        query.sort(req.query.sort);
    }

    if (req.query.limit) {
        query.limit(parseInt(req.query.limit));
    }

    if (req.query.skip) {
        query.skip(parseInt(req.query.skip));
    }

    query.exec(function (err, entries) {

        if (err) {
            console.error(err);
            return res.json([]);
        }
        if (req.query.sort) {
            return res.json(docsToObject(entries))
        }

        var sortedEntries = {};
        entries.forEach(function (e) {
            sortedEntries[e._id.toString()] = e;
        });

        var result = [];
        req.collection.entries.forEach(function (id) {
            if (typeof sortedEntries[id] !== 'undefined') {
                result.push(docsToObject(sortedEntries[id]));
            }
        });

        res.json(result);
    });
});


router.get('/projects/:project/collections/:collection/drafts', function (req, res) {
    Draft.findDraftsInCollectionForUser(req.collection, req.user, function (err, drafts) {
        res.json(drafts);
    })
});

router.get('/projects/:project/collections/:collection/entries/:entry', function (req, res) {
    res.json(docsToObject(req.entry));
});

router.get('/projects/:project/collections/:collection/drafts/:draft', function (req, res) {
    res.json(docsToObject(req.draft));
});

router.get('/templates', function (req, res) {
    Template.find({}).select('name icon tags identifier').exec(function (err, templates) {
        res.json(docsToObject(templates));
    });
});

router.get('/me/events', function (req, res) {
    if (typeof req.user === 'undefined') {
        return res.status(404).json({error: true, message: 'no events for unauthentificated user'});
    }

    var projectIds = req.user.projects.map(function (p) {
        return p._id.toString();
    });

    Event.find({
            '$or': [
                {'data.user._id': req.user._id.toString()},
                {'data.project._id': {'$in': projectIds}}
            ]
        })
        .select('-data.previousValue -_id')
        .limit(12)
        .sort({date: 'desc'}).exec(function (err, events) {
        res.json(docsToObject(events));
    });

});

router.get('/users/me', function (req, res) {
    res.json(req.user.toObject());
});

module.exports = router;
