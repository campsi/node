'use strict';
var Project = require('../models/project');
var Collection = require('../models/collection');
var Entry = require('../models/entry');
var Draft = require('../models/draft');
var Template = require('../models/template');
var Context = require('../lib/campsi-app/context');
var browserConfig = require('../browser-config');
module.exports = {
    patchRouter: function (router) {
        var getQueryForObjectIdOrIdentifier = function (param) {
            var query = {};
            if (param.match(/^[0-9a-fA-F]{24}$/)) {
                query._id = param;
            } else {
                query.identifier = param;
            }
            return query;
        };
        router.use('/*', function (req, res, next) {
            req.context = new Context();
            req.context.user = req.user;
            req.context.config = browserConfig;
            next();
        });
        router.param('project', function (req, res, next, project) {
            if (project === 'new') {
                return next();
            }
            var query = getQueryForObjectIdOrIdentifier(project);
            var isGetApiCall = req.api === true && req.method === 'GET';
            Project.find(query).populate({
                path: 'collections',
                select: 'name _id identifier hasFields icon entries'
            }).select('title demo icon identifier collections notes url billing').exec(function (err, projects) {
                if (projects.length > 0) {
                    req.project = projects[0];
                    if (req.user) {
                        req.project.roles = req.user.getRolesForProject(projects[0]);
                        if (req.project.roles.length === 0 && project.demo !== true && !isGetApiCall) {
                            res.status(403);
                            res.send('');
                        } else {
                            return next();
                        }
                    }
                    if (req.project.demo || isGetApiCall) {
                        return next();
                    }
                    res.status(403);
                    res.send('');
                }
                res.status(404);
                res.send('');
            });
        });
        router.param('collection', function (req, res, next, collection) {
            if (collection === 'new') {
                return next();
            }
            var query = getQueryForObjectIdOrIdentifier(collection);
            query._project = req.project._id;
            var find = Collection.find(query);
            find.exec(function (err, collections) {
                if (collections.length > 0) {
                    req.collection = collections[0];
                    return next();
                }
                res.status(404);
                res.send('');
            });
        });
        router.param('entry', function (req, res, next, entry) {
            var query = getQueryForObjectIdOrIdentifier(entry);
            query._collection = req.collection._id;
            Entry.find(query, function (err, entries) {
                if (entries.length > 0) {
                    req.entry = entries[0];
                    return next();
                }
                res.status(404);
                res.send('');
            });
        });
        router.param('draft', function (req, res, next, draft) {
            var query = getQueryForObjectIdOrIdentifier(draft);
            query._collection = req.collection._id;
            Draft.find(query, function (err, drafts) {
                if (drafts.length > 0) {
                    req.draft = drafts[0];
                    req.draft.draft = true;
                    return next();
                }
                res.status(404);
                res.send('');
            });
        });
        router.param('template', function (req, res, next, template) {
            var query = getQueryForObjectIdOrIdentifier(template);
            Template.find(query, function (err, templates) {
                if (templates.length > 0) {
                    req.template = templates[0];
                    return next();
                }
                res.status(404);
                res.send('');
            });
        });
    }
};