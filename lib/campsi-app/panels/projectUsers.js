'use strict';
var Panel = require('../panel');
var backButton = require('./buttons/backButton');
var saveButton = require('./buttons/saveButton');
module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.projectUsers.header.title'),
        id: 'project-users',
        component: 'campsi/project/users',
        theme: 'dark',
        nav: ['project'],
        actions: ['save'],
        componentValue: {}
    });
};