var router = require('express').Router();
var resources = require('../../../middleware/resources');
var Project = require('../../../models/project');
var Collection = require('../../../models/collection');
var Entry = require('../../../models/entry');
resources(router);


router.delete('/projects/:project', function(req, res, next){
    Project.remove({_id: req.project._id}, function(err){
        if(err){
            res.status(500);
            return res.json(err);
        }

        res.json({});
    });
});

router.delete('/projects/:project/collections/:collection', function(req, res, next){
    Collection.remove({_id: req.collection._id}, function(err){
        if(err){
            res.status(500);
            return res.json(err);
        }

        res.json({});
    });
});

router.delete('/projects/:project/collections/:collection/entries/:entry', function(req, res, next){
    Entry.remove({_id: req.entry._id}, function(err){
        if(err){
            res.status(500);
            return res.json(err);
        }

        res.json({});
    });
});

module.exports = router;