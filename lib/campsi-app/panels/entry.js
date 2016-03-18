var Panel = require('../panel');
var saveButton = require('./buttons/saveButton');
var button = require('./buttons/button');
var backButton = require('./buttons/backButton');

module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.entry.header.title'),
        id: 'entry',
        component: 'campsi/entry',
        leftButtons: [backButton(app, 'entriesAndDrafts')],
        rightButtons: [
            saveButton(app),
            button(app.translate('btns.publish'), 'paper-plane', 'publish'),
            button(app.translate('btns.delete'), 'trash-o', 'delete')
        ],
        componentValue: {}
    });
};