var Panel = require('../panel');
var button = require('./buttons/button');
var backButton = require('./buttons/backButton');
var saveButton = require('./buttons/saveButton');
var linkButton = require('./buttons/linkButton');
module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.project.header.title'),
        id: 'project',
        component: 'campsi/project',
        leftButtons: [backButton(app, 'projects')],
        rightButtons: [
            button(app.translate('btns.delete'), 'trash-o', 'delete'),
            linkButton('projectUsers', app.translate('btns.projectUsers'), 'users', 'users'),
            linkButton('projectBilling', app.translate('btns.projectBilling'), 'billing', 'billing'),
            saveButton(app)
        ]
    });
};