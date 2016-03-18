var Panel = require('../panel');
var saveButton = require('./buttons/saveButton');

module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.entries.header.title'),
        id: 'entriesAndDrafts',
        component: 'campsi/entries-and-drafts',
        theme: 'dark',
        leftButtons: [
            {
                tag: 'a',
                attr: {class: 'back', href: 'project'},
                content: app.translate('btns.back'),
                icon: 'angle-left'
            }
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