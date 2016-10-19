'use strict';
var Route = require('../route');
var route = new Route({
    name: 'draft',
    path: '/projects/:project/collections/:collection/drafts/:draft',
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
        'entriesAndDrafts',
        'draft'
    ]
});
route.onEnter = function (app, next) {
    app.panels.entry.addClass('draft');
    app.panels.entry.removeClass('new');
    next();
};
module.exports = route;