var Panel = require('../panel');

module.exports = function (app) {
    return new Panel({
        title: 'Dashboard',
        id: 'dashboard',
        component: 'campsi/dashboard',
        leftButtons: [{
            tag: 'a', attr: {class: 'welcome', href: 'root'}, content: app.translate('btns.home'), icon: 'list'
        }],
        rightButtons: [{
            tag: 'button', attr: {class: 'logout'}, content: app.translate('btns.logout'), icon: 'sign-out'
        }, {
            tag: 'a',
            attr: {class: 'projects', href: 'projects'},
            content: app.translate('btns.projects'),
            icon: 'list'
        }]
    });
};