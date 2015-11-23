var express = require('express');
var router = express.Router();
var resources = require('../middleware/resources');
resources.patchRouter(router);

router.get('/projects/:project/collections/:collection', function (req, res, next) {
    req.collection.populate('entries', function (err, populated) {
        var collection = populated.toObject();
        collection.entries = collection.entries.map(function (e) {
            return {data: e.data};
        });

        collection.templates = collection.templates.map(function (t) {
            return {
                markup: t.markup,
                scope: t.scope,
                identifier: t.identifier
            }
        });

        var filename = collection.identifier || collection.name;

        delete collection._id;
        delete collection.id;
        delete collection._project;
        delete collection.__v;
        delete collection.hasFields;

        res.header('Content-Disposition', 'attachment; filename=' + filename + '.json');
        res.json(collection);
    })
});

module.exports = router;
