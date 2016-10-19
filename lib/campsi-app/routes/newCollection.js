'use strict';
var Route = require('../route');
var route = new Route({
    name: 'newCollection',
    path: '/projects/:project/collections/new',
    layout: {
        welcome: ['prev'],
        projects: ['prev'],
        editProject: ['prev'],
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
        'components'
    ]
});
route.onEnter = function (app, next) {
    app.panel('editCollection').addClass('new');
    app.invalidate('collection', function(){
        app.panels.editCollection.setValue({
            fields: []
        }, next);
    });
};
module.exports = route;