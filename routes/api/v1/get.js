var router = require('express').Router();
var resources = require('../../../middleware/resources');
var Project = require('../../../models/project');
resources(router);

router.get('/projects/', function(req, res, next){
    Project.list(req.user, function(err, projects){
        res.json(projects.map(function(p){
            return p.toObject()
        }));
    });
});
router.get('/projects/:project', function(req, res, next){
    res.json(req.project.toObject());
});

router.get('/projects/:project/collections/:collection', function(req, res, next){
    res.json(req.collection.toObject());
});

router.get('/projects/:project/collections/:collection/entries/:entry', function(req, res, next){
    res.json(req.entry.toObject());
});

module.exports = router;
