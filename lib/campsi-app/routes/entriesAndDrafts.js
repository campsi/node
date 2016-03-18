var Route = require('../route');

var route = new Route({
    name: 'entriesAndDrafts',
    path: '/projects/:project/collections/:collection/admin',
    layout: {
        welcome: ['prev'],
        dashboard: ['prev'],
        projects: ['prev'],
        project: ['prev'],
        billing: ['prev'],
        projectUsers: ['prev'],
        entriesAndDrafts: ['w50', 'main'],
        entry: ['w50', 'l50']
    },
    resources: ['project', 'collection', 'entriesAndDrafts']
});

module.exports = route;