var Route = require('../route');

var route = new Route({
    name:'fieldProperties',
    path: '/projects/:project/collections/:collection/properties/:fieldName',
    layout:{
        welcome: ['prev'],
        dashboard: ['prev'],
        projects: ['prev'],
        project: ['prev'],
        billing: ['prev'],
        projectUsers: ['prev'],
        collection: ['w70'],
        fieldProperties: ['w30', 'l70', 'main']
    },
    resources: ['project', 'collection']
});

route.onEnter = function(app, next){
    app.getResource('collection').getData(undefined, function(data){
        app.panels.fieldProperties.setValue({
            collection: data,
            fieldName: app.params.fieldName
        },  next);
    });

};

module.exports = route;