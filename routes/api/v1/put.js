var router = require('express').Router();
var resources = require('../../../middleware/resources');
var mongoose = require('mongoose');

resources(router);

var returnId = function (item) {
    return mongoose.Types.ObjectId(item._id);
};

router.put('/projects/:project', function(req, res, next){

    var project = req.project;

    project.title = req.body.title || project.title;

    var returnId = function (item) {
        return mongoose.Types.ObjectId(item._id);
    };

    if (typeof req.body.admins !== 'undefined') {
        project.admins = req.body.admins.map(returnId);
    }
    if (typeof req.body.designers !== 'undefined') {
        project.designers = req.body.designers.map(returnId);
    }
    if (typeof req.body.collections !== 'undefined') {
        // todo DELETE obsolete collections
        project.collections = req.body.collections.map(returnId);
    }
    if (typeof req.body.icon !== 'undefined') {
        project.icon = req.body.icon;
    }
    if (typeof req.body.identifier !== 'undefined') {
        project.identifier = req.body.identifier;
    }

    project.save(function (err, result) {
        res.json(result);
    });
});

router.put('/projects/:project/collections/:collection', function(req, res, next){
    var collection = req.collection;

    collection.name = req.body.name || collection.name;

    if (typeof req.body.fields !== 'undefined') {
        collection.fields = req.body.fields;
    }

    if (typeof req.body.templates !== 'undefined') {
        collection.templates = req.body.templates;
    }

    if (typeof req.body.identifier !== 'undefined') {
        collection.identifier = req.body.identifier;
    }

    if (typeof req.body.entries !== 'undefined') {
        collection.entries = req.body.entries.map(returnId);
    }

    console.info(collection.entries);

    collection.save(function (err, result) {
        res.json(result);
    });
});

router.put('/projects/:project/collections/:collection/entries/:entry', function(req, res, next){

    var entry = req.entry;

    if (typeof req.body.data !== 'undefined') {
        entry.markModified('data');
        entry.data = req.body.data;
    }

    entry.save(function(err, result){
        res.json(result);
    });
});

module.exports = router;
