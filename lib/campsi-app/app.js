var Context = require('./context');
var Resource = require('./resource');
var async = require('async');

module.exports = function (serialized) {

    var app = new Context(serialized);

    app.setResources({
        projects: new Resource('api/v1/projects', {
            project: new Resource('/:project', {
                collection: new Resource('/collections/:collection', {
                    entries: new Resource('/entries'),
                    entriesAndDrafts: new Resource('/entries-and-drafts'),
                    entry: new Resource('/entries/:entry'),
                    draft: new Resource('/drafts/:draft')
                }),
                projectUsers: new Resource('/users'),
                projectGuests: new Resource('/guests'),
                projectBilling: new Resource('/billing')
            })
        }),
        components: new Resource('api/v1/components'),
        templates: new Resource('api/v1/templates'),
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
        components: require('./panels/components')(app),
        fieldProperties: require('./panels/fieldProperties')(app),
        entriesAndDrafts: require('./panels/entriesAndDrafts')(app),
        entry: require('./panels/entry')(app)
    });

    app.setRoutes(require('./routes'));

    app.getResource('me').onChange(function (data, cb) {
        app.panels.dashboard.setValue({user: data}, cb);
    });

    app.getResource('projects').onChange(function (data, cb) {
        app.panels.projects.setValue(data, cb);
    });

    app.getResource('project').onChange(function (data, cb) {
        app.panels.project.setValue(data, cb);
    });

    app.getResource('projectUsers').onChange(function (data, cb) {
        app.panels.projectUsers.setValue(data, cb);
    });

    app.getResource('collection').onChange(function (data, cb) {

        if (typeof data === 'undefined') {
            data = {fields: []};
        }

        async.parallel([function (next) {
            app.panels.collection.setValue({
                _id: data._id,
                name: data.name,
                identifier: data.identifier,
                fields: data.fields
            }, next);
        }, function (next) {
            app.panels.entry.setComponentOptions({
                fields: data.fields
            }, next);
        }, function(next){
            app.panels.fieldProperties.setValue({
                collection: data
            }, next)
        }], cb);
    });

    app.getResource('entriesAndDrafts').onChange(function (data, cb) {
        app.panels.entriesAndDrafts.setValue(data, cb)
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

    return app;
};