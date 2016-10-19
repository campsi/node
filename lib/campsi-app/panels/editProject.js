'use strict';
var Panel = require('../panel');
var button = require('./buttons/button');
var backButton = require('./buttons/backButton');
var saveButton = require('./buttons/saveButton');
var linkButton = require('./buttons/linkButton');
module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.editProject.header.title'),
        id: 'project-editor',
        component: 'campsi/project-editor',
        nav: ['project', 'projectUsers', 'projectBilling'],
        actions: ['save', 'delete', 'download']
    });
};