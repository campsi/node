'use strict';
var Panel = require('../panel');
var saveButton = require('./buttons/saveButton');
var button = require('./buttons/button');
var backButton = require('./buttons/backButton');
module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.entry.header.title'),
        id: 'entry',
        component: 'campsi/entry',

        nav: ['collection'],
        actions: ['save', 'publish', 'delete'],
        componentValue: {}
    });
};