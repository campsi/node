'use strict';
var Panel = require('../panel');
var saveButton = require('./buttons/saveButton');
var backButton = require('./buttons/backButton');
var linkButton = require('./buttons/linkButton');
module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.entries.header.title'),
        id: 'entriesAndDrafts',
        component: 'campsi/entries-and-drafts',
        theme: 'dark',
        nav: ['project', 'editCollection', 'newEntry'],
        actions: ['save'],
        componentValue: {
            drafts: [],
            entries: []
        }
    });
};