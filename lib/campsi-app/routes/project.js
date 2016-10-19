'use strict';
var Route = require('../route');
var admin = new Route({
    name: 'project',
    path: '/projects/:project',
    layout: {
        welcome: ['prev'],
        projects: ['w40'],
        project: [
            'l40',
            'w60',
            'main'
        ]
    },
    resources: ['projects','project']
});

module.exports = admin;