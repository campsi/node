'use strict';
var Route = require('../route');
var route = new Route({
    name: 'projectBilling',
    path: '/projects/:project/billing',
    layout: {
        welcome: ['prev'],
        projects: ['prev'],
        editProject: ['w70'],
        billing: [
            'l70',
            'w30',
            'main'
        ]
    },
    resources: ['project']
});


module.exports = route;