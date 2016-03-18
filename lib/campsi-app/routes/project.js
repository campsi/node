var Route = require('../route');

var route = new Route({
    name: 'project',
    path: '/projects/:project',
    layout: {
        welcome: ['prev'],
        dashboard: ['prev'],
        projects: ['w30'],
        project: ['l30', 'w70', 'main']
    },
    resources: ['projects', 'project']
});

module.exports = route;