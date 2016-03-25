var Route = require('../route');

var route = new Route({
    name: 'newEntry',
    path: '/projects/:project/collections/:collection/admin/new',
    layout: {
        welcome: ['prev'],
        dashboard: ['prev'],
        projects: ['prev'],
        project: ['prev'],
        billing: ['prev'],
        projectUsers: ['prev'],
        entriesAndDrafts: ['w50'],
        entry: ['w50', 'l50', 'main']
    },
    resources: ['project', 'collection', 'entriesAndDrafts']
});


route.onEnter = function (app, next) {
    app.invalidate(['entry', 'draft'], next);
    app.panels.entry.removeClass('draft');
    app.panels.entry.addClass('new');
};

module.exports = route;