var router = require('express').Router();
var resources = require('../../../middleware/resources');
var Project = require('../../../models/project');
var Collection = require('../../../models/collection');
var Entry = require('../../../models/entry');
var Draft = require('../../../models/draft');
var Campsi = require('campsi-core');

resources.patchRouter(router);


router.delete('/projects/:project', function(req, res){
    Project.remove({_id: req.project._id}, function(err){
        if(err){
            res.status(500);
            return res.json(err);
        }

        res.json({});

        Campsi.eventbus.emit('project:delete', {
            project: req.project,
            user: req.user
        });
    });
});

router.delete('/projects/:project/collections/:collection', function(req, res){
    Collection.remove({_id: req.collection._id}, function(err){
        if(err){
            res.status(500);
            return res.json(err);
        }

        res.json({});

        Campsi.eventbus.emit('collection:delete', {
            project: req.project,
            collection: req.collection,
            user: req.user
        });
    });
});

router.delete('/projects/:project/collections/:collection/entries/:entry', function(req, res){
    Entry.remove({_id: req.entry._id}, function(err){
        if(err){
            res.status(500);
            return res.json(err);
        }

        res.json({});

        Campsi.eventbus.emit('entry:delete', {
            project: req.project,
            collection: req.collection,
            entry: req.entry,
            user: req.user
        });
    });
});


router.delete('/projects/:project/collections/:collection/drafts/:draft', function(req, res){
    Draft.remove({_id: req.draft._id}, function(err){
        if(err){
            res.status(500);
            return res.json(err);
        }

        res.json({});

        Campsi.eventbus.emit('drafts:delete', {
            project: req.project,
            collection: req.collection,
            draft: req.draft,
            user: req.user
        });
    });
});

module.exports = router;
