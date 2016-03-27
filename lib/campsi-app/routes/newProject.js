var Route = require('../route');
var isBrowser = require('is-browser');
var route = new Route({
    name: 'newProject',
    path: '/projects/new',
    layout: {
        welcome: ['prev'],
        dashboard: ['prev'],
        projects: ['w30'],
        project: ['l30', 'w70', 'main']
    },
    resources: ['projects'/*, 'templates'*/]
});

route.onEnter = function(app, next){
    if(typeof app.user === 'undefined'){
        app.redirect('/');
        if(isBrowser){
            require('../browser/auth')();
        }
    }

    app.panel('project').addClass('new');
    app.invalidate('project', next);
};

module.exports = route;