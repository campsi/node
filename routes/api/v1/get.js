var router = require('express').Router();
var resources = require('../../../middleware/resources');
var Project = require('../../../models/project');
var Entry = require('../../../models/entry');
var Draft = require('../../../models/draft');
var Template = require('../../../models/template');
var handlebars = require('handlebars');
var extend = require('extend');

resources.patchRouter(router);

router.get('/projects/', function (req, res) {
    Project.list(req.user, function (err, projects) {
        res.json(projects.map(function (p) {
            return p.toObject()
        }));
    });
});
router.get('/projects/:project', function (req, res) {
    res.json(req.project.toObject());
});

router.get('/projects/:project/users', function (req, res) {
    req.project.getUsers(function (err, users) {
        res.json(users.map(function (u) {
            var obj = u.toObject();
            delete obj.projects;
            return obj;
        }));
    })
});

router.get('/projects/:project/deployments', function (req, res) {
    Project.findOne({_id: req.project._id}).select('deployments').exec(function (err, project) {
        res.json(project);
    });
});

router.get('/projects/:project/guests', function (req, res) {
    req.project.getGuests(function (err, guests) {
        res.json(guests);
    })
});

router.get('/projects/:project/collections/:collection', function (req, res) {
    res.json(req.collection.toObject());
});

router.get('/projects/:project/collections/:collection/entries-and-drafts', function (req, res) {
    req.collection.getEntriesAndDrafts(req.user, function (err, items) {
        var drafts = items.drafts.map(function (i) {
            return i.toObject();
        });
        var entries = items.entries.map(function (i) {
            return i.toObject();
        });
        res.json({drafts: drafts, entries: entries});
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
        query.limit(req.query.limit);
    }

    if (req.query.skip) {
        query.limit(req.query.skip);
    }

    query.exec(function (err, entries) {

        if (req.query.sort) {
            return res.json(entries.map(function (e) {
                return e.toObject();
            }))
        }

        var sortedEntries = {};
        entries.forEach(function (e) {
            sortedEntries[e._id.toString()] = e;
        });

        var result = [];
        req.collection.entries.forEach(function (id) {
            if (typeof sortedEntries[id] !== 'undefined') {
                result.push(sortedEntries[id].toObject());
            }
        });

        if (req.query.template && templates[req.query.template]) {
            var template = handlebars.compile(templates[req.query.template]);
            res.send(template({entries: result}));
        } else {
            res.json(result);
        }
    });
});


router.get('/projects/:project/collections/:collection/drafts', function (req, res) {
    Draft.findDraftsInCollectionForUser(req.collection, req.user, function (err, drafts) {
        res.json(drafts);
    })
});

router.get('/projects/:project/collections/:collection/entries/:entry', function (req, res) {
    if (typeof req.query.template === 'undefined') {
        return res.json(req.entry.toObject());
    }
    var templateObj;

    req.collection.templates.forEach(function (t) {
        if (t.identifier === req.query.template) {
            templateObj = t;
        }
    });

    if (typeof templateObj !== 'undefined') {
        var template = handlebars.compile(templateObj.markup);
        return res.send(template(req.entry.toObject()));
    }

    return res.json(req.entry.toObject());

});


router.get('/projects/:project/collections/:collection/drafts/:draft', function (req, res) {
    res.json(req.draft.toObject());
});

router.get('/templates', function (req, res) {
    Template.find({}).select('name icon tags identifier').exec(function (err, templates) {
        res.json(templates.map(function (t) {
            return t.toObject()
        }));
    });
});

module.exports = router;
