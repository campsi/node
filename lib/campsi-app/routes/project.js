'use strict';
var Route = require('../route');
var route = new Route({
    name: 'project',
    path: '/projects/:project',
    layout: {
        welcome: ['prev'],
        dashboard: ['prev'],
        projects: ['w30'],
        project: [
            'l30',
            'w70',
            'main'
        ]    //collections: ['l70', 'w30']
    },
    resources: [
        'projects',
        'project'    /*, 'templates'*/
    ]
});
route.onEnter = function (app, next) {
    app.panel('project').removeClass('new');
    next();
};
module.exports = route;