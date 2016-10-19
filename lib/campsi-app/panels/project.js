'use strict';
var Panel = require('../panel');
var linkButton = require('./buttons/linkButton');
var backButton = require('./buttons/backButton');
module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.project.header.title'),
        id: 'project',
        component: 'campsi/project',
        theme: 'light',
        componentValue: [],
        nav: ['projects', 'editProject']
    });
};