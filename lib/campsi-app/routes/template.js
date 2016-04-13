var Route = require('../route');

var route = new Route({
    name: 'template',
    path: '/templates/:template',
    layout: {
        templates: ['w20'],
        template: ['w50', 'l20', 'main'],
        components: ['w30', 'l70']
    },
    resources: ['templates', 'template', 'components']
});

module.exports = route;