'use strict';
var Panel = require('../panel');
module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.collections.header.title'),
        id: 'collections',
        component: 'campsi/collections',
        theme: 'light',
        componentValue: [],
        leftButtons: [{
            tag: 'button',
            attr: { class: 'logout' },
            content: app.translate('btns.logout'),
            icon: 'sign-out'
        }],
        rightButtons: []
    });
};