var Panel = require('../panel');
var backButton = require('./buttons/backButton');
module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.projectUsers.header.title'),
        id: 'projectUsers',
        component: 'campsi/project/users',
        theme: 'dark',
        leftButtons: [backButton(app, 'project')],
        componentValue: {}
    });
};