var Panel = require('../panel');

module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.collections.header.title'),
        id: 'collections',
        component: 'campsi/collections',
        theme: 'dark',
        componentValue: [],
        leftButtons: [],
        rightButtons: []
    });
};