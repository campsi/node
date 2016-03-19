var Panel = require('../panel');
var backButton = require('./buttons/backButton');

module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.fieldProperties.header.title'),
        id: 'fieldProperties',
        component: 'campsi/collection/field-properties',
        componentValue: {},
        theme: 'dark',
        leftButtons: [backButton(app, 'collection')],
        rightButtons: []
    });
};