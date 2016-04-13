var Route = require('../route');

var admin = new Route({
    name: 'admin',
    path: '/projects/:project/admin',
    layout: {
        welcome: ['prev'],
        dashboard: ['prev'],
        projects: ['prev'],
        project: ['w30'],
        billing: ['prev'],
        projectUsers: ['prev'],
        collection: ['prev'],
        components: ['prev'],
        entriesAndDrafts: ['w30', 'l30'],
        entry: ['w40', 'l60']
    },
    resources: ['project']
});

module.exports = admin;