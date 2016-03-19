var Route = require('../route');

var route = new Route({
    name: 'projectUsers',
    path: '/projects/:project/users',
    layout: {
        welcome: ['prev'],
        dashboard: ['prev'],
        projects: ['prev'],
        project: ['w70'],
        projectUsers: ['l70', 'w30', 'main']
    },
    resources: ['project', 'templates', 'projectUsers']
});

module.exports = route;