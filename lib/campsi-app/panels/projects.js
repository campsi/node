var Panel = require('../panel');
var linkButton = require('./buttons/linkButton');

module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.projects.header.title'),
        id: 'projects',
        component: 'campsi/projects',
        theme: 'dark',
        leftButtons: [backButton(app, 'dashboard')]
    });
};