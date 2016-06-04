'use strict';
var Route = require('../../route');
var admin = new Route({
    name: 'collections',
    path: '/projects/:project',
    layout: require('./layout'),
    resources: ['project']
});

admin.onEnter = function(app,next){
    console.info('collections');
    next();
};
module.exports = admin;