'use strict';
var Route = require('../route');
var route = new Route({
    name: 'newProject',
    path: '/projects/new',
    layout: {
        welcome: ['prev'],
        projects: ['w30'],
        editProject: [
            'l30',
            'w70',
            'main'
        ]
    },
    resources: ['projects'    /*, 'templates'*/]
});
route.onEnter = function (app, next) {
    app.panel('project').addClass('new');
    app.invalidate('project', next);
};
module.exports = route;