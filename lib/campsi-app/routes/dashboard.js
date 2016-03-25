var Route = require('../route');

var route = new Route({
    name: 'dashboard',
    path: '/dashboard',
    layout: {
        dashboard: ['w80', 'main'],
        projects: ['w20', 'l80']
    },
    resources: ['me', 'projects']
});

module.exports = route;