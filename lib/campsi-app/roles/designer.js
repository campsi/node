'use strict';
var async = require('async');

module.exports = function (app) {
    app.setRoutes([
        require('./../routes/welcome'),
        require('./../routes/dashboard'),
        require('./../routes/projects'),
        require('./../routes/newProject'),
        require('./../routes/project'),
        require('./../routes/projectUsers'),
        require('./../routes/projectBilling'),
        require('./../routes/newCollection'),
        require('./../routes/fieldProperties'),
        require('./../routes/collection'),
        require('./../routes/entriesAndDrafts'),
        require('./../routes/newEntry'),
        require('./../routes/entry'),
        require('./../routes/draft'),
        require('./../routes/templates'),
        require('./../routes/template')
    ]);

    app.setPanels({
        welcome: require('../panels/welcome')(app),
        dashboard: require('../panels/dashboard')(app),
        projects: require('../panels/projects')(app),
        project: require('../panels/project')(app),
        projectUsers: require('../panels/projectUsers')(app),
        billing: require('../panels/billing')(app),
        collection: require('../panels/collection')(app),
        collections: require('../panels/collections')(app),
        components: require('../panels/components')(app),
        fieldProperties: require('../panels/fieldProperties')(app),
        entriesAndDrafts: require('../panels/entriesAndDrafts')(app),
        entry: require('../panels/entry')(app),
        templates: require('../panels/templates')(app),
        template: require('../panels/template')(app)
    });

    app.getResource('project').onChange(function (data, cb) {
        if (data && data.demo) {
            app.panels.project.addClass('demo');
            app.panels.collection.addClass('demo');
            app.panels.entriesAndDrafts.addClass('demo');
            app.panels.entry.addClass('demo');
        } else {
            app.panels.project.removeClass('demo');
            app.panels.collection.removeClass('demo');
            app.panels.entriesAndDrafts.removeClass('demo');
            app.panels.entry.removeClass('demo');
        }
        app.panels.project.setValue(data, function () {
            if (data) {
                app.panels.collections.setValue(data.collections, function () {
                    app.panels.billing.setValue(data.billing, cb);
                });
            } else {
                cb();
            }
        });
    });

    app.getResource('collection').onChange(function (data, cb) {

        if (typeof data === 'undefined') {
            return cb();
        }

        async.parallel([
            function (next) {
                app.panels.collection.setValue({
                    _id: data._id,
                    name: data.name,
                    identifier: data.identifier,
                    fields: data.fields
                }, next);
            },
            function (next) {
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

    require('./common')(app);

};