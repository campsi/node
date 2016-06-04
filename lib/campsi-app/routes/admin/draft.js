'use strict';
var Route = require('../../route');
var route = new Route({
    name: 'draft',
    path: '/projects/:project/collections/:collection/drafts/:draft',
    layout: require('./layout'),
    resources: [
        'project',
        'collection',
        'entriesAndDrafts',
        'draft'
    ]
});
route.onEnter = function (app, next) {
    app.panels.entry.addClass('draft');
    app.panels.entry.removeClass('new');
    next();
};
module.exports = route;