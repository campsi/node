'use strict';
var Route = require('../route');
var route = new Route({
    name: 'newEntry',
    path: '/projects/:project/collections/:collection/admin/new',
    layout: {
        welcome: ['prev'],
        projects: ['prev'],
        editProject: ['prev'],
        billing: ['prev'],
        projectUsers: ['prev'],
        project: ['w20'],
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
        'entriesAndDrafts'
    ]
});
route.onEnter = function (app, next) {
    app.invalidate([
        'entry',
        'draft'
    ], next);
    app.panels.entry.removeClass('draft');
    app.panels.entry.addClass('new');
};
module.exports = route;