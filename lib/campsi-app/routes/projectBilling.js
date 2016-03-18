var Route = require('../route');

var route = new Route({
    name: 'projectBilling',
    path: '/projects/:project/billing',
    layout: {
        welcome: ['prev'],
        dashboard: ['prev'],
        projects: ['prev'],
        project: ['w70'],
        billing: ['l70', 'w30', 'main']
    },
    resources: ['project']
});

module.exports = route;