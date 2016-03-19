var Route = require('../route');

var route = new Route({
    name: 'draft',
    path: '/projects/:project/collections/:collection/drafts/:draft',
    layout: {
        welcome: ['prev'],
        dashboard: ['prev'],
        projects: ['prev'],
        project: ['prev'],
        billing: ['prev'],
        projectUsers: ['prev'],
        entriesAndDrafts: ['w50'],
        entry: ['w50', 'l50', 'main']
    }
    , resources: ['project', 'collection', 'entriesAndDrafts', 'draft']
});

route.onEnter = function(app, next){
    app.panels.entry.addClass('draft');
    next();
};

module.exports = route;