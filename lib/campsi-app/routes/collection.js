'use strict';
var Route = require('../route');
var route = new Route({
    name: 'collection',
    path: '/projects/:project/collections/:collection',
    layout: {
        welcome: ['prev'],
        projects: ['prev'],
        editProject: ['prev'],
        billing: ['prev'],
        projectUsers: ['prev'],
        project: ['w20'],
        entriesAndDrafts: [
            'w40',
            'l20',
            'main'
        ],
        entry: [
            'w40',
            'l60'
        ]
    },
    resources: [
        'project',
        'collection',
        'entriesAndDrafts'
    ]
});
route.onEnter = function (app, next) {
    app.panels.entry.addClass('new');
    app.panels.entry.removeClass('modified draft');
    app.panels.entry.setValue({}, next);
};
module.exports = route;