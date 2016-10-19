'use strict';
var Route = require('../route');
var collection = new Route({
    name: 'editCollection',
    path: '/projects/:project/collections/:collection/edit',
    layout: {
        welcome: ['prev'],
        projects: ['prev'],
        project: ['prev'],
        billing: ['prev'],
        projectUsers: ['prev'],
        editCollection: [
            'w70',
            'main'
        ],
        components: [
            'w30',
            'l70'
        ]
    },
    resources: [
        'project',
        'collection',
        'components'
    ]
});

collection.onEnter = function (app, next) {
    var panel = app.panel('editCollection');
    if (panel.component) {
        panel.component.component.removeHighlighting();
    }
    panel.removeClass('new');
    next();
};
module.exports = collection;