'use strict';

module.exports = function(app){

    app.setRoutes([
        //require('./../routes/dashboard'),
        require('./../routes/admin/collections'),
        require('./../routes/admin/entriesAndDrafts'),
        require('./../routes/admin/newEntry'),
        require('./../routes/admin/entry'),
        require('./../routes/admin/draft')
    ]);

    app.setPanels({
        dashboard: require('../panels/dashboard')(app),
        collections: require('../panels/collections')(app),
        entriesAndDrafts: require('../panels/entriesAndDrafts')(app),
        entry: require('../panels/entry')(app)
    });


    app.getResource('project').onChange(function (data, cb) {
        app.panels.collections.setValue(data.collections, cb);
    });


    require('./common')(app);
};