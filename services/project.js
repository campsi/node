var Project = require('../models/project');
var utils = require('./utils');
var getProjectsQuery = function (query) {
    return Project
        .find(query || {})
        .populate({
            path: 'collections',
            select: 'name _id'
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

    list: function(query, callback){
        Project.find(query).select('_id name icon').exec(function(err, results){
           callback(results.map(utils.toObject));
        });
    },

    find: function(query, callback){
        getProjectsQuery(query).exec(function (err, results) {
            callback(results.map(utils.toObject));
        });
    }
};