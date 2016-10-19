'use strict';
var Route = require('../route');
var route = new Route({
    name: 'entry',
    path: '/projects/:project/collections/:collection/entries/:entry',
    layout: {
        welcome: ['prev'],
        projects: ['prev'],
        editProject: ['prev'],
        billing: ['prev'],
        collection: ['prev'],
        projectUsers: ['prev'],
        project: ['w20', 'optional'],
        entriesAndDrafts: ['w40', 'l20'],
        entry: [
            'w40',
            'l60',
            'main'
        ]
    },
    resources: [
        'project',
        'collection',
        'entriesAndDrafts',
        'entry'
    ]
});
route.onEnter = function (app, next) {
    app.panels.entry.removeClass('new draft');
    next();
};
module.exports = route;