'use strict';
var Route = require('../route');
var route = new Route({
    name: 'projects',
    path: '/projects',
    layout: {
        welcome: ['prev'],
        projects: [
            'w100',
            'main'
        ]
    },
    resources: ['projects']
});
module.exports = route;