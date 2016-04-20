'use strict';
var Route = require('../route');
var route = new Route({
    name: 'templates',
    path: '/templates',
    layout: {
        templates: [
            'w20',
            'main'
        ],
        template: [
            'w50',
            'l20'
        ],
        components: [
            'w30',
            'l70'
        ]
    },
    resources: [
        'templates',
        'components'
    ]
});
module.exports = route;