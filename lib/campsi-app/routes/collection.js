'use strict';
var Route = require('../route');
var collection = new Route({
    name: 'collection',
    path: '/projects/:project/collections/:collection',
    layout: {
        welcome: ['prev'],
        dashboard: ['prev'],
        projects: ['prev'],
        project: ['prev'],
        billing: ['prev'],
        projectUsers: ['prev'],
        collection: [
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
    var panel = app.panel('collection');
    if (panel.component) {
        panel.component.component.removeHighlighting();
    }
    panel.removeClass('new');
    next();
};
module.exports = collection;