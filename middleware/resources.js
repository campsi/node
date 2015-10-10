var Project = require('../models/project');
var Collection = require('../models/collection');
var Entry = require('../models/entry');

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
        Project.find(getQueryForObjectIdOrIdentifier(project))
            .populate({
                path: 'collections',
                select: 'name _id identifier'
            })
            .populate({
                path: 'admins',
                select: 'name picture nickname _id'
            })
            .populate({
                path: 'designers',
                select: 'name picture nickname _id'
            }).exec(function (err, projects) {
                        if (projects.length > 0) {
                            req.project = projects[0];
                            return next();
                        }
                        return next();
                    });
    });

    router.param('collection', function (req, res, next, collection) {
        var query = getQueryForObjectIdOrIdentifier(collection);
        query._project = req.project._id;

        var find = Collection.find(query);
/*
        find.select('_id identifier name');

        var embed = req.query.with;

        if(typeof embed !== 'undefined'){

            if(!Array.isArray(embed)){
                embed = [embed];
            }

            if(embed.indexOf('entries') > -1){
                find.select('entries');
                find.populate({path: 'entries', select: 'data'});
            }

            if(embed.indexOf('fields') > -1){
                find.select('fields');
            }

        }*/
        find.populate({path: 'entries', select: 'data'});

        find.exec(function (err, collections) {
            if (collections.length > 0) {
                req.collection = collections[0];
                req.collection.__project = req.project.identity();
                return next();
            }
            return next();
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
            return next();
        });
    });
};