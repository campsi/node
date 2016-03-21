var Panel = require('../panel');
var button = require('./buttons/button');

module.exports = function (app) {
    return new Panel({
        title: '',
        id: 'welcome',
        component: 'campsi/landing',
        leftButtons: [],
        theme: 'dark',
        rightButtons: [
            button(app.translate('btns.login'), '', 'login'),
            button(app.translate('btns.signup'), '', 'signup')
        ]
    });
};