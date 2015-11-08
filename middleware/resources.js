var Project = require('../models/project');
var Collection = require('../models/collection');
var Entry = require('../models/entry');
var Draft = require('../models/draft');
var Context = require('app-context');

module.exports = function (router) {

    var getQueryForObjectIdOrIdentifier = function (param) {
        var query = {};
        if (param.match(/^[0-9a-fA-F]{24}$/)) {
            query._id = param;
        } else {
            query.identifier = param;
        }
        return query;
    };

    router.use('/*', function(req, res, next){
        req.context = new Context();
        next();
    });

    router.param('project', function (req, res, next, project) {

        if (project === 'new') {
            return next();
        }

        var query = getQueryForObjectIdOrIdentifier(project);

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
                    }

                    req.context.set('project', req.project);
                    return next();
                }
                res.status(404);
                res.send('');
            });
    });

    router.param('collection', function (req, res, next, collection) {
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
};