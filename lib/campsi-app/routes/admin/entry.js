'use strict';
var Route = require('../../route');
var route = new Route({
    name: 'entry',
    path: '/projects/:project/collections/:collection/entries/:entry',
    layout: require('./layout'),
    resources: [
        'project',
        'collection',
        'entriesAndDrafts',
        'entry'
    ]
});
route.onEnter = function (app, next) {
    app.panels.entry.removeClass('new draft');
    next();
};
module.exports = route;