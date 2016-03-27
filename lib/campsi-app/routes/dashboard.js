var Route = require('../route');

var route = new Route({
    name: 'dashboard',
    path: '/dashboard',
    layout: {
        dashboard: ['w80', 'main'],
        projects: ['w20', 'l80']
    },
    resources: ['me', 'projects']
});

route.onEnter = function(app, next){
    if(typeof app.user === 'undefined'){
        return app.redirect('/');
    }
    next();
};

module.exports = route;