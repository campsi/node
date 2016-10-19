'use strict';
var async = require('async');

module.exports = function (app) {
    app.setRoutes([
        require('./../routes/welcome'),
        require('./../routes/projects'),
        require('./../routes/newProject'),
        require('./../routes/editProject'),
        require('./../routes/project'),
        require('./../routes/projectUsers'),
        require('./../routes/projectBilling'),
        require('./../routes/newCollection'),
        require('./../routes/fieldProperties'),
        require('./../routes/editCollection'),
        require('./../routes/collection'),
        require('./../routes/newEntry'),
        require('./../routes/entry'),
        require('./../routes/draft'),
        require('./../routes/templates'),
        require('./../routes/template')
    ]);

    app.setPanels({
        welcome: require('../panels/welcome')(app),
        projects: require('../panels/projects')(app),
        project: require('../panels/project')(app),
        editProject: require('../panels/editProject')(app),
        projectUsers: require('../panels/projectUsers')(app),
        billing: require('../panels/billing')(app),
        editCollection: require('../panels/editCollection')(app),
        components: require('../panels/components')(app),
        fieldProperties: require('../panels/fieldProperties')(app),
        entriesAndDrafts: require('../panels/entriesAndDrafts')(app),
        entry: require('../panels/entry')(app),
        templates: require('../panels/templates')(app),
        template: require('../panels/template')(app)
    });

    app.getResource('project').onChange(function (data, cb) {
        if (data && data.demo) {
            app.panels.editProject.addClass('demo');
            app.panels.editCollection.addClass('demo');
            app.panels.entriesAndDrafts.addClass('demo');
            app.panels.entry.addClass('demo');
        } else {
            app.panels.editProject.removeClass('demo');
            app.panels.editCollection.removeClass('demo');
            app.panels.entriesAndDrafts.removeClass('demo');
            app.panels.entry.removeClass('demo');
        }

        app.panels.editProject.setValue(data, function () {
            if (data) {
                app.panels.editProject.setTitle(data.title);
                app.panels.project.setTitle(data.title);
                app.panels.project.setValue(data, function () {
                    app.panels.billing.setValue(data.billing, cb);
                });
            } else {
                cb();
            }
        });
    });

    app.getResource('fieldName').onChange(function (data, cb) {
        if (data) {
            app.panels.fieldProperties.setTitle(data.label);
        }
        cb();
    });

    app.getResource('collection').onChange(function (data, cb) {

        if (typeof data === 'undefined') {
            return cb();
        }

        async.parallel([
            function (next) {
                app.panels.editCollection.setValue({
                    _id: data._id,
                    name: data.name,
                    identifier: data.identifier,
                    fields: data.fields
                }, next);
            },
            function (next) {
                app.panels.entriesAndDrafts.setTitle(data.name);
                app.panels.entry.setComponentOptions({fields: data.fields}, next);
            },
            function (next) {
                app.panels.fieldProperties.setValue({collection: data}, next);
            }
        ], cb);
    });


    app.getResource('projectUsers').onChange(function (data, cb) {
        app.panels.projectUsers.setValue(data, cb);
    });

    app.getResource('projects').onChange(function (data, cb) {
        app.panels.projects.setValue(data, cb);
    });

    app.getResource('components').onChange(function (data, cb) {
        app.panels.components.setValue(data, cb);
    });

    app.getResource('templates').onChange(function (data, cb) {
        app.panels.templates.setValue(data, cb);
    });
    app.getResource('template').onChange(function (data, cb) {
        app.panels.template.setValue(data, cb);
    });

    app.getResource('collection').onChange(function (data, cb) {

        if (typeof data === 'undefined') {
            return cb();
        }

        app.panels.entry.setComponentOptions({fields: data.fields}, function () {
            app.panels.project.setComponentOptions({currentCollectionId: data._id}, cb);
        });
    });

    app.getResource('entriesAndDrafts').onChange(function (data, cb) {
        app.panels.entriesAndDrafts.setValue(data, cb);
    });
    app.getResource('components').onChange(function (data, cb) {
        app.panels.components.setValue(data, cb);
    });
    app.getResource('entry').onChange(function (data, cb) {
        app.panels.entry.setValue(data, cb);
    });
    app.getResource('draft').onChange(function (data, cb) {
        app.panels.entry.setValue(data, cb);
    });

};