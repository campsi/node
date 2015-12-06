var express = require('express');
var router = express.Router();
var resources = require('../middleware/resources');
resources.patchRouter(router);

router.get('/projects/:project/collections/:collection', function (req, res, next) {
    var filename = req.collection.identifier || req.collection.name;
    res.header('Content-Disposition', 'attachment; filename=' + filename + '.json');
    req.collection.export(function(data){
        res.json(data);
    });
});

module.exports = router;
