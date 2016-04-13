var Panel = require('../panel');
var saveButton = require('./buttons/saveButton');
var button = require('./buttons/button');
var backButton = require('./buttons/backButton');


module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.template.header.title'),
        id: 'template',
        theme: 'light',
        component: 'campsi/template',
        leftButtons: [
            backButton(app, 'templates')
        ],
        rightButtons: [
            button(app.translate('btns.delete'), 'trash-o', 'delete'),
            saveButton(app)
        ]
    });
};