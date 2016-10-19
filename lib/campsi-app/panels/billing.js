'use strict';
var Panel = require('../panel');
var backButton = require('./buttons/backButton');
var saveButton = require('./buttons/saveButton');
module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.billing.header.title'),
        id: 'billing',
        component: 'campsi/billing',
        theme: 'dark',
        nav: ['editProject'],
        actions: ['save'],
        componentValue: {}
    });
};

