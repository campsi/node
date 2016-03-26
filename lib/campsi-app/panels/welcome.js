var Panel = require('../panel');
var button = require('./buttons/button');
var linkButton = require('./buttons/linkButton');

module.exports = function (app) {
    return new Panel({
        title: '',
        id: 'welcome',
        component: 'campsi/landing',
        leftButtons: [],
        theme: 'dark',
        rightButtons: [
            button(app.translate('btns.login'), 'sign-in', 'login'),
            button(app.translate('btns.signup'), 'user-plus', 'signup'),
            linkButton('dashboard', app.translate('btns.dashboard'), 'tachometer', 'dashboard')
        ]
    });
};