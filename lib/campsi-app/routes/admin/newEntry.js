'use strict';
var Route = require('../../route');
var route = new Route({
    name: 'newEntry',
    path: '/projects/:project/collections/:collection/admin/new',
    layout: require('./layout'),
    resources: [
        'project',
        'collection',
        'entriesAndDrafts'
    ]
});
route.onEnter = function (app, next) {
    app.invalidate([
        'entry',
        'draft'
    ], next);
    app.panels.entry.removeClass('draft');
    app.panels.entry.addClass('new');
};
module.exports = route;