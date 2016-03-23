var Route = require('../route');
var isBrowser = require('is-browser');
var route = new Route({
    name: 'fieldProperties',
    path: '/projects/:project/collections/:collection/properties/:fieldName',
    layout: {
        welcome: ['prev'],
        dashboard: ['prev'],
        projects: ['prev'],
        project: ['prev'],
        billing: ['prev'],
        projectUsers: ['prev'],
        collection: ['w70'],
        fieldProperties: ['w30', 'l70', 'main']
    },
    resources: ['project', 'collection']
});

route.onEnter = function (app, next) {
    return app.panels.fieldProperties.setValue({
        collection: (isBrowser) ? app.panels.collection.getValue() : app.resources.collection.data,
        fieldName: app.params.fieldName
    }, next);
};

module.exports = route;