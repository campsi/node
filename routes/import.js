var express = require('express');
var router = express.Router();
var resources = require('../middleware/resources');
var Template = require('../models/template');
resources.patchRouter(router);

router.post('/templates', function (req, res) {
    Template.create(req.body, function (err, template) {
        if (err) {
            res.status(400);
        }
        res.json(err || template);
    });
});

module.exports = router;
