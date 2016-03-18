var Route = require('../route');

var route = new Route({
    name: 'newProject',
    path: '/projects/new',
    layout: {
        welcome: ['prev'],
        dashboard: ['prev'],
        projects: ['w30'],
        project: ['l30', 'w70', 'main']
    },
    resources: ['projects', 'templates']
});

route.onEnter = function(app, next){
    app.invalidate('project', next);
};

module.exports = route;