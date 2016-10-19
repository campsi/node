'use strict';

module.exports = function (app) {

    app.getResource('collection').onChange(function (data, cb) {

        if (typeof data === 'undefined') {
            return cb();
        }

        app.panels.entry.setComponentOptions({fields: data.fields}, cb);
    });

    app.getResource('entriesAndDrafts').onChange(function (data, cb) {
        app.panels.entriesAndDrafts.setValue(data, cb);
    });
    app.getResource('components').onChange(function (data, cb) {
        app.panels.components.setValue(data, cb);
    });
    app.getResource('entry').onChange(function (data, cb) {
        app.panels.entry.setValue(data, cb);
    });
    app.getResource('draft').onChange(function (data, cb) {
        app.panels.entry.setValue(data, cb);
    });
};