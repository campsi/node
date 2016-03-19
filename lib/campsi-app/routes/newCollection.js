var Route = require('../route');

var route = new Route({
    name: 'newCollection',
    path: '/projects/:project/collections/new',
    layout: {
        welcome: ['prev'],
        dashboard: ['prev'],
        projects: ['prev'],
        project: ['prev'],
        billing: ['prev'],
        projectUsers: ['prev'],
        collection: ['w70', 'main'],
        components: ['w30', 'l70']
    },
    resources: ['project']
});

route.onEnter = function (app, next) {
    app.panel('collection').addClass('new');
    app.invalidate('collection', next);
};

module.exports = route;