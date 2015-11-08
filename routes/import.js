var express = require('express');
var router = express.Router();
var resources = require('../middleware/resources');
var Template = require('../models/template');
resources(router);

router.post('/templates', function (req, res) {
    Template.create(req.body, function(err, template){
        res.json(err || template);
    });
});

module.exports = router;
