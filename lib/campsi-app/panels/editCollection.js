'use strict';
var Panel = require('../panel');
var saveButton = require('./buttons/saveButton');
var linkButton = require('./buttons/linkButton');
var button = require('./buttons/button');
var backButton = require('./buttons/backButton');
module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.editCollection.header.title'),
        id: 'collection',
        component: 'campsi/collection',
        componentValue: {},
        nav: ['project', 'collection'],
        actions: ['save', 'delete', 'download']
    });
};