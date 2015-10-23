var Project = require('../models/project');
var Collection = require('../models/collection');
var Entry = require('../models/entry');
var ObjectId = require('mongoose').Types.ObjectId;

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

    router.param('project', function (req, res, next, project) {


        if (project === 'new') {
            return next();
        }

        var query = getQueryForObjectIdOrIdentifier(project);

        Project.find(query)
            .populate({
                path: 'collections',
                select: 'name _id identifier'
            })
            .select("title demo icon identifier collections")
            .exec(function (err, projects) {
                if (projects.length > 0) {
                    req.project = projects[0];
                    req.project.roles = req.user.getRolesForProject(projects[0]);
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

        find.populate({path: 'entries', select: 'data'});

        find.exec(function (err, collections) {
            if (collections.length > 0) {
                req.collection = collections[0];
                req.collection.__project = req.project.identity();
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
                req.entry.__collection = req.collection.identity();
                return next();
            }

            res.status(404);
            res.send('');
        });
    });
};