var Panel = require('../panel');
var backButton = require('./buttons/backButton');
module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.billing.header.title'),
        id: 'billing',
        component: 'campsi/billing',
        theme: 'dark',
        leftButtons: [backButton(app, 'project')],
        componentValue: {}
    });
};