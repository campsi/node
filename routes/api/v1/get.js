'use strict';
var router = require('express').Router();
var resources = require('../../../middleware/resources');
var Project = require('../../../models/project');
var Entry = require('../../../models/entry');
var Event = require('../../../models/event');
var Draft = require('../../../models/draft');
var Template = require('../../../models/template');
var extend = require('extend');
var docsToObject = require('../../../lib/campsi-app/server/docToObject');
var async = require('async');
var deepCopy = require('deepcopy');
var app = require('../../../lib/campsi-app/app')({ config: require('../../../config') });
resources.patchRouter(router);
router.get('/projects/', function (req, res) {
    Project.list(req.user, function (err, projects) {
        var jsonProjects = docsToObject(projects);
        jsonProjects.map(function (p) {
            p._links = {
                self: app.getResource('project').getUrl({ project: p }),
                canonical: app.getResource('project').getUrl({ project: p }, true),
                users: app.getResource('projectUsers').getUrl({ project: p })
            };
        });
        res.json(jsonProjects);
    });
});
router.get('/projects/:project', function (req, res) {
    var json = docsToObject(req.project);
    json._links = {
        self: app.getResource('project').getUrl({ project: json }),
        canonical: app.getResource('project').getUrl({ project: json }, true),
        projects: app.getResource('projects').getUrl()
    };
    json.collections.map(function (c) {
        c._links = {
            self: app.getResource('collection').getUrl({
                project: req.project,
                collection: c
            }),
            canonical: app.getResource('collection').getUrl({
                project: req.project,
                collection: c
            }, true),
            entries: app.getResource('entries').getUrl({
                project: req.project,
                collection: c
            })
        };
    });
    res.json(json);
});
router.get('/projects/:project/users', function (req, res) {
    req.project.getUsersAndGuests(function (err, usersAndGuests) {
        var json = usersAndGuests;
        json._links = {
            self: app.getResource('projectUsers').getUrl({ project: req.project }),
            canonical: app.getResource('projectUsers').getUrl({ project: req.project }, true),
            project: app.getResource('project').getUrl({ project: req.project })
        };
        res.json(json);
    });
});
router.get('/projects/:project/collections/:collection', function (req, res) {
    var json = docsToObject(req.collection);
    json._links = {
        self: app.getResource('collection').getUrl({
            project: req.project,
            collection: json
        }),
        canonical: app.getResource('collection').getUrl({
            project: req.project,
            collection: json
        }, true),
        entries: app.getResource('entries').getUrl({
            project: req.project,
            collection: json
        }),
        project: app.getResource('project').getUrl({ project: req.project })
    };
    res.json(json);
});
router.get('/projects/:project/collections/:collection/entries-and-drafts', function (req, res) {
    req.collection.getEntriesAndDrafts(req.user, function (err, entriesAndDrafts) {
        res.json(docsToObject(entriesAndDrafts));
    });
});
router.get('/projects/:project/collections/:collection/entries', function (req, res) {
    var queryParameters = {};
    var param;
    for (param in req.query) {
        if (req.query.hasOwnProperty(param) && param.indexOf('data.') === 0) {
            queryParameters[param] = req.query[param];
        }
    }
    var params = extend({}, queryParameters, { _collection: req.collection._id });
    var json = {
        count: 0,
        _links: {
            self: app.getResource('entries').getUrl({
                project: req.project,
                collection: req.collection
            }),
            canonical: app.getResource('entries').getUrl({
                project: req.project,
                collection: req.collection
            }, true),
            collection: app.getResource('collection').getUrl({
                project: req.project,
                collection: req.collection
            }),
            project: app.getResource('project').getUrl({ project: req.project })
        },
        entries: []
    };
    function addLinksToEntries() {
        json.entries.forEach(function (e) {
            e._links = {
                self: app.getResource('entry').getUrl({
                    project: req.project,
                    collection: req.collection,
                    entry: e
                }),
                canonical: app.getResource('entry').getUrl({
                    project: req.project,
                    collection: req.collection,
                    entry: e
                }, true)
            };
        });
    }
    function getFieldValue(data, path) {
        var fieldValue = data;
        var parts = path.split('/');
        parts.forEach(function (part) {
            if (part && fieldValue[part]) {
                fieldValue = fieldValue[part];
            } else {
                fieldValue = undefined;
            }
        });
        return fieldValue;
    }
    function setFieldValue(data, value, path) {
        var fieldValue = data;
        var parts = path.split('/');
        var i = 0;
        for (; i < parts.length; i++) {
            if (i === parts.length - 1 && fieldValue) {
                fieldValue[parts[i]] = value;
            } else if (fieldValue[parts[i]]) {
                fieldValue = fieldValue[parts[i]];
            } else {
                return;
            }
        }
    }
    function embedReferenceFields(next) {
        var refFields = req.collection.getReferenceFields();
        var entryHash = {};
        async.forEach(json.entries, function (entry, eachEntryCallback) {
            async.forEach(refFields, function (refField, eachRefFieldCallback) {
                var fieldValue = getFieldValue(entry.data, refField.path);
                console.info('');
                console.info(refField.path, fieldValue);
                if (typeof fieldValue === 'undefined') {
                    return eachRefFieldCallback();
                }
                var _ids = deepCopy(fieldValue);
                if (!Array.isArray(fieldValue)) {
                    _ids = [_ids];
                }
                async.forEachOf(_ids, function (_id, index, eachIdCallback) {
                    if (entryHash[_id]) {
                        _id = entryHash[_id];
                        return eachIdCallback();
                    }
                    Entry.findOne({ _id: _id }, function (err, entry) {
                        if (err) {
                            return eachIdCallback();
                        }
                        _ids[index] = entry.toObject().data;
                        eachIdCallback();
                    });
                }, function () {
                    fieldValue = refField.multiple ? _ids : _ids[0];
                    setFieldValue(entry.data, fieldValue, refField.path);
                    eachRefFieldCallback();
                });
            }, eachEntryCallback);
        }, next);
    }
    async.series([
        function countEntries(cb) {
            Entry.count(params, function (countError, count) {
                json.count = count;
                cb();
            });
        },
        function getEntries(cb) {
            var query = Entry.find(params).select('data');
            req.query.skip = req.query.skip ? parseInt(req.query.skip) : 0;
            req.query.limit = req.query.limit ? parseInt(req.query.limit) : 100;
            // todo const
            if (req.query.sort) {
                query.sort(req.query.sort);
            }
            query.limit(req.query.limit);
            var nextIndex = req.query.skip + req.query.limit;
            if (nextIndex < json.count) {
                json._links.next = json._links.self + '?skip=' + nextIndex + '&limit=' + req.query.limit;
            }
            var prevIndex = req.query.skip - req.query.limit;
            if (prevIndex < 0) {
                prevIndex = 0;
            }
            if (req.query.skip > 0) {
                json._links.prev = json._links.self + '?skip=' + prevIndex + '&limit=' + req.query.limit;
            }
            query.skip(parseInt(req.query.skip));
            query.exec(function (err, entries) {
                if (err) {
                    console.error(err);
                    return cb();
                }
                //var containsRef = req.collection.containsReferenceField();
                if (req.query.sort) {
                    json.entries = docsToObject(entries);
                    addLinksToEntries();
                    embedReferenceFields(cb);
                }
                var sortedEntries = {};
                entries.forEach(function (e) {
                    sortedEntries[e._id.toString()] = e;
                });
                req.collection.entries.forEach(function (id) {
                    if (typeof sortedEntries[id] !== 'undefined') {
                        json.entries.push(docsToObject(sortedEntries[id]));
                    }
                });
                addLinksToEntries();
                embedReferenceFields(cb);
            });
        }
    ], function () {
        res.json(json);
    });
});
router.get('/projects/:project/collections/:collection/drafts', function (req, res) {
    Draft.findDraftsInCollectionForUser(req.collection, req.user, function (err, drafts) {
        res.json(drafts);
    });
});
router.get('/projects/:project/collections/:collection/entries/:entry', function (req, res) {
    var json = docsToObject(req.entry);
    var params = {
        project: req.project,
        collection: req.collection,
        entry: req.entry
    };
    json._links = {
        self: app.getResource('entry').getUrl(params),
        canonical: app.getResource('entry').getUrl(params, true),
        collection: app.getResource('collection').getUrl(params),
        project: app.getResource('project').getUrl(params)
    };
    res.json(json);
});
router.get('/projects/:project/collections/:collection/drafts/:draft', function (req, res) {
    res.json(docsToObject(req.draft));
});
router.get('/templates', function (req, res) {
    Template.find({}).select('name icon tags identifier').exec(function (err, templates) {
        res.json(docsToObject(templates));
    });
});
router.get('/templates/:template', function (req, res) {
    res.json(docsToObject(req.template));
});
router.get('/me/events', function (req, res) {
    if (typeof req.user === 'undefined') {
        return res.status(404).json({
            error: true,
            message: 'no events for unauthentificated user'
        });
    }
    var projectIds = req.user.projects.map(function (p) {
        return p._id.toString();
    });
    Event.find({
        '$or': [
            { 'data.user._id': req.user._id.toString() },
            { 'data.project._id': { '$in': projectIds } }
        ]
    }).select('-data.previousValue -_id').limit(12).sort({ date: 'desc' }).exec(function (err, events) {
        res.json(docsToObject(events));
    });
});
router.get('/users/me', function (req, res) {
    if (req.user) {
        return res.json(req.user.toObject());
    }
    res.json({});
});
module.exports = router;