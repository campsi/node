var Project = require('../../../models/project');
var Component = require('../../../models/component');
var docToObject = require('./docToObject');

module.exports = function (app) {

    app.getResource('projects').load = function (url, callback) {
        Project.list(docToObject(app.user), callback);
    };

    app.getResource('components').load = function (url, callback) {
        Component.find({}, function(err, components){
            callback(err, docToObject(components))
        });
    };

    app.getResource('entriesAndDrafts').load = function (url, callback){
        app.req.collection.getEntriesAndDrafts(app.user, function(err, entriesAndDrafts){
            callback(err, docToObject(entriesAndDrafts))
        });
    };

    app.getResource('projectUsers').load = function(url, callback){
        app.req.project.getUsersAndGuests(function(err, usersAndGuests){
            console.info(docToObject(usersAndGuests));
            callback(err, docToObject(usersAndGuests));
      });
    };
};