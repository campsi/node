var Panel = require('../panel');

module.exports = function (app) {
    return new Panel({
        title: app.translate('welcome'),
        id: 'welcome',
        component: 'campsi/landing',
        leftButtons: [],
        rightButtons: []
    });
};