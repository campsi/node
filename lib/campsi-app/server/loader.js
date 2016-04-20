'use strict';
var Project = require('../../../models/project');
var Component = require('../../../models/component');
var Template = require('../../../models/template');
var docToObject = require('./docToObject');
module.exports = function (app) {
    app.getResource('me').load = function (url, callback) {
        callback(null, docToObject(app.user));
    };
    app.getResource('projects').load = function (url, callback) {
        Project.list(docToObject(app.user), function (err, projects) {
            callback(err, docToObject(projects));
        });
    };
    app.getResource('components').load = function (url, callback) {
        Component.find({}, function (err, components) {
            callback(err, docToObject(components));
        });
    };
    app.getResource('templates').load = function (url, callback) {
        Template.find({}, function (err, templates) {
            callback(err, docToObject(templates));
        });
    };
    app.getResource('entriesAndDrafts').load = function (url, callback) {
        app.req.collection.getEntriesAndDrafts(app.user, function (err, entriesAndDrafts) {
            callback(err, docToObject(entriesAndDrafts));
        });
    };
    app.getResource('projectUsers').load = function (url, callback) {
        app.req.project.getUsersAndGuests(function (err, usersAndGuests) {
            callback(err, usersAndGuests);
        });
    };
};