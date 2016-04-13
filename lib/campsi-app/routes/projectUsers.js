var Route = require('../route');

var route = new Route({
    name: 'projectUsers',
    path: '/projects/:project/users',
    layout: {
        welcome: ['prev'],
        dashboard: ['prev'],
        projects: ['w20'],
        project: ['w40', 'l20'],
        projectUsers: ['l60', 'w40', 'main']
    },
    resources: ['projects', 'project', /*'templates',*/ 'projectUsers']
});

module.exports = route;