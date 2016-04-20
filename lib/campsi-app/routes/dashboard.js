'use strict';
var Route = require('../route');
var route = new Route({
    name: 'dashboard',
    path: '/dashboard',
    layout: {
        dashboard: [
            'w70',
            'main'
        ],
        projects: [
            'w30',
            'l70'
        ]
    },
    resources: [
        'me',
        'projects'
    ]
});
route.onEnter = function (app, next) {
    if (typeof app.user === 'undefined') {
        return app.redirect('/');
    }
    next();
};
module.exports = route;