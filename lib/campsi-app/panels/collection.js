var Panel = require('../panel');
var saveButton = require('./buttons/saveButton');
var linkButton = require('./buttons/linkButton');

module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.collection.header.title'),
        id: 'collection',
        component: 'campsi/collection',
        componentValue: {},
        leftButtons: [{
            tag: 'a',
            attr: {class: 'back', href: 'project'},
            content: app.translate('btns.back'),
            icon: 'times'
        }],
        rightButtons: [
            {tag: 'button', attr: {class: 'delete'}, content: app.translate('btns.delete'), icon: 'trash-o'},
            saveButton(app),
            linkButton('entriesAndDrafts', app.translate('btns.admin'), 'pencil', 'admin')
        ]
    });
};