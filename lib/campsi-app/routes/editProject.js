'use strict';
var Route = require('../route');
var route = new Route({
    name: 'editProject',
    path: '/projects/:project/edit',
    layout: {
        welcome: ['prev'],
        projects: ['w40'],
        project: ['next'],
        editProject: [
            'l40',
            'w60',
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