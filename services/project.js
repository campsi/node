var Project = require('../models/project');
var Collection = require('../models/collection');
var utils = require('./utils');
var getProjectsQuery = function (query) {
    return Project
        .find(query || {})
        .populate({
            path: 'collections',
            select: 'name _id _project'
        })
        .populate({
            path: 'admins',
            select: 'name picture nickname _id'
        })
        .populate({
            path: 'designers',
            select: 'name picture nickname _id'
        });
};


module.exports = {

    list: function (query, callback) {
        Project.find(query).select('_id title icon').exec(function (err, results) {
            if (err !== null) {
                console.error(err);
                return callback([]);
            }
            callback(results.map(utils.toObject));
        });
    },
    create: function (value, callback) {
        Project.create(value, function (err, project) {
            callback(utils.toObject(project));
        });
    },

    find: function (query, callback) {
        getProjectsQuery(query).exec(function (err, results) {
            if (err !== null) {
                console.error(err);
                return callback([]);
            }
            callback(results.map(utils.toObject));
        });
    },

    createCollection: function (projectId, callback) {
        Project.findOne({_id: projectId}, function (err, project) {
            Collection.create({
                _project: project._id,
                name: 'New collection',
                fields: []
            }, function (err, result) {
                project.collections.push(result._id);
                project.save(function () {
                    callback(utils.toObject(result));
                });
            });
        });
    }
};