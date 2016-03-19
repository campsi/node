var Panel = require('../panel');
var saveButton = require('./buttons/saveButton');
var linkButton = require('./buttons/linkButton');
var button = require('./buttons/button');
var backButton = require('./buttons/backButton');

module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.collection.header.title'),
        id: 'collection',
        component: 'campsi/collection',
        componentValue: {},
        leftButtons: [
            backButton(app, 'project'),
            linkButton('entriesAndDrafts', app.translate('btns.admin'), 'pencil', 'admin')
        ],
        rightButtons: [
            button(app.translate('btns.delete'), 'trash-o', 'delete'),
            saveButton(app)
        ]
    });
};