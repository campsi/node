'use strict';
var Panel = require('../panel');
module.exports = function (app) {
    return new Panel({
        title: app.translate('panels.components.header.title'),
        id: 'components',
        theme: 'dark',
        component: 'campsi/collection-designer/components'
    }, []);
};