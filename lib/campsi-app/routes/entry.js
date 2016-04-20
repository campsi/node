'use strict';
var Route = require('../route');
var route = new Route({
    name: 'entry',
    path: '/projects/:project/collections/:collection/entries/:entry',
    layout: {
        welcome: ['prev'],
        dashboard: ['prev'],
        projects: ['prev'],
        project: ['prev'],
        billing: ['prev'],
        projectUsers: ['prev'],
        entriesAndDrafts: ['w50'],
        entry: [
            'w50',
            'l50',
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