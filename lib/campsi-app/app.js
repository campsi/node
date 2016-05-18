'use strict';
var Context = require('./context');
var Resource = require('./resource');
var async = require('async');
module.exports = function (serialized) {
    var app = new Context(serialized);
    app.setResources({
        projects: new Resource('api/v1/projects', {
            project: new Resource('/:project', {
                collections: new Resource('/collections', {
                    collection: new Resource('/:collection', {
                        entries: new Resource('/entries'),
                        entriesAndDrafts: new Resource('/entries-and-drafts'),
                        entry: new Resource('/entries/:entry'),
                        draft: new Resource('/drafts/:draft')
                    })
                }),
                projectUsers: new Resource('/users'),
                projectGuests: new Resource('/guests'),
                projectBilling: new Resource('/billing')
            })
        }),
        components: new Resource('api/v1/components'),
        templates: new Resource('api/v1/templates', { template: new Resource('/:template') }),
        me: new Resource('api/v1/users/me')
    });
    app.setPanels({
        welcome: require('./panels/welcome')(app),
        dashboard: require('./panels/dashboard')(app),
        projects: require('./panels/projects')(app),
        project: require('./panels/project')(app),
        projectUsers: require('./panels/projectUsers')(app),
        billing: require('./panels/billing')(app),
        collection: require('./panels/collection')(app),
        collections: require('./panels/collections')(app),
        components: require('./panels/components')(app),
        fieldProperties: require('./panels/fieldProperties')(app),
        entriesAndDrafts: require('./panels/entriesAndDrafts')(app),
        entry: require('./panels/entry')(app),
        templates: require('./panels/templates')(app),
        template: require('./panels/template')(app)
    });
    app.setRoutes(require('./routes'));
    app.getResource('me').onChange(function (data, cb) {
        app.panels.dashboard.setValue({ user: data }, cb);
    });
    app.getResource('projects').onChange(function (data, cb) {
        app.panels.projects.setValue(data, cb);
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
                app.panels.collections.setValue(data.collections, function(){
                    app.panels.billing.setValue(data.billing, cb);
                });
            } else {
                cb();
            }
        });
    });
    app.getResource('projectUsers').onChange(function (data, cb) {
        app.panels.projectUsers.setValue(data, cb);
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
                app.panels.entry.setComponentOptions({ fields: data.fields }, next);
            },
            function (next) {
                app.panels.fieldProperties.setValue({ collection: data }, next);
            }
        ], cb);
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
    app.getResource('templates').onChange(function (data, cb) {
        app.panels.templates.setValue(data, cb);
    });
    app.getResource('template').onChange(function (data, cb) {
        app.panels.template.setValue(data, cb);
    });
    return app;
};