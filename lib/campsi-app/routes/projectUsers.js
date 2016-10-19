'use strict';
var Route = require('../route');
var route = new Route({
    name: 'projectUsers',
    path: '/projects/:project/users',
    layout: {
        welcome: ['prev'],
        projects: ['prev'],
        editProject: [
            'w60'
        ],
        projectUsers: [
            'l60',
            'w40',
            'main'
        ]
    },
    resources: [
        'projects',
        'project',
        /*'templates',*/
        'projectUsers'
    ]
});
module.exports = route;