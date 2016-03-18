var Project = require('../../../models/project');
var Component = require('../../../models/component');

module.exports = function (app) {


    app.getResource('projects').load = function (url, callback) {
        Project.list(app.user, callback);
    };

    app.getResource('components').load = function (url, callback) {
        Component.find({}, callback);
    };

    app.getResource('entriesAndDrafts').load = function (url, callback){
        app.getResource('collection').data.getEntriesAndDrafts(app.user, callback);
    };

    app.getResource('projectUsers').load = function(url, callback){
      app.getResource('project').data.getUsersAndGuests(function(err, usersAndGuests){
          callback(err, usersAndGuests);
      });
    };
};