var Panel = require('../panel');
var saveButton = require('./buttons/saveButton');
var backButton = require('./buttons/backButton');
var linkButton = require('./buttons/linkButton');
module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.entries.header.title'),
        id: 'entriesAndDrafts',
        component: 'campsi/entries-and-drafts',
        theme: 'dark',
        leftButtons: [
            backButton(app, 'project'),
            linkButton('collection', app.translate('btns.collection'), 'pencil-square-o', 'collection')
        ],
        rightButtons: [
            saveButton(app),
            {
                tag: 'a',
                attr: {class: 'new', href: 'newEntry'},
                content: app.translate('btns.newEntry'),
                icon: 'plus'
            }
        ],
        componentValue: {drafts: [], entries: []}
    });
};