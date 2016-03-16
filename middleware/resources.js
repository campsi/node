var Organization = require('../models/organization');
var Project = require('../models/project');
var Collection = require('../models/collection');
var Entry = require('../models/entry');
var Draft = require('../models/draft');
var Template = require('./../models/template');
var Component = require('../models/component');
var Context = require('../lib/campsi-app/context');
var browserConfig = require('../browser-config');

module.exports = {

    getProjects: function (req, res, next) {
        Project.list(req.user, function (err, results) {
            req.projects = results;
            next();
        });
    },

    getProjectDeployments: function (req, res, next) {
        Project.findOne({_id: req.project._id}).select('deployments').exec(function (err, project) {
            req.projectDeployments = project.deployments;
            next();
        });
    },
    getComponents: function (req, res, next) {
        Component.find({}, function (err, results) {
            req.components = results;
            req.context.set('components', req.components);
            next()
        });
    },
    getTemplates: function (req, res, next) {
        Template.find({}).select('identifier name icon tags').exec(function (err, results) {
            req.templates = results;
            req.context.set('templates', req.templates);
            next()
        });
    },

    getEntriesAndDrafts: function (req, res, next) {
        req.collection.getEntriesAndDrafts(req.user, function (err, items) {
            req.entriesAndDrafts = items;
            next();
        });
    },


    getProjectUsers: function (req, res, next) {
        req.project.getUsers(function (err, users) {
            req.projectUsers = users.map(function (u) {
                var obj = u.toObject();
                delete obj.projects;
                return obj;
            });
            next();
        });
    },
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

        router.param('organization', function (req, res, next, organization) {

            var query = getQueryForObjectIdOrIdentifier(organization);

            Organization.find(query).exec(function (err, organizations) {
                if (organizations.length > 0) {
                    req.organization = organizations[0];
                    req.context.set('organization', req.organization);
                    return next();
                }
                res.status(404);
                res.send('');
            });
        });

        router.param('project', function (req, res, next, project) {

            if (project === 'new') {
                return next();
            }

            var query = getQueryForObjectIdOrIdentifier(project);
            var isGetApiCall = (req.api === true && req.method === 'GET');

            Project.find(query)
                .populate({
                    path: 'collections',
                    select: 'name _id identifier hasFields icon'
                })
                .select("title demo icon identifier collections websiteUrl")
                .exec(function (err, projects) {
                    if (projects.length > 0) {
                        req.project = projects[0];

                        if (req.user) {
                            req.project.roles = req.user.getRolesForProject(projects[0]);
                            if (req.project.roles.length === 0 && project.demo !== true && !isGetApiCall) {
                                res.status(403);
                                res.send('');
                            } else {
                                req.context.set('project', req.project);
                                return next();
                            }
                        }

                        if (req.project.demo || isGetApiCall) {
                            req.context.set('project', req.project);
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
                    req.context.set('collection', req.collection);
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
                    req.context.set('entry', req.entry);
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
                    req.context.set('draft', req.draft);
                    return next();
                }

                res.status(404);
                res.send('');
            });
        });
    }
};