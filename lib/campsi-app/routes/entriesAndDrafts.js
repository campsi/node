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

route.onEnter = function(app, next){
    app.panels.entry.addClass('new');
    app.panels.entry.removeClass('modified draft');
    app.panels.entry.setValue({}, next);
};

module.exports = route;