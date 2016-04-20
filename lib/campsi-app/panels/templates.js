'use strict';
var Panel = require('../panel');
module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.templates.header.title'),
        id: 'templates',
        theme: 'dark',
        component: 'campsi/templates'
    });
};