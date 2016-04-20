'use strict';
var Panel = require('../panel');
var backButton = require('./buttons/backButton');
module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.projects.header.title'),
        id: 'projects',
        component: 'campsi/projects',
        theme: 'dark',
        leftButtons: [backButton(app, 'dashboard')]
    });
};