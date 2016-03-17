var router = require('express').Router();
var resources = require('../../../middleware/resources');
var mongoose = require('mongoose');
var slug = require('slug');
var Draft = require('../../../models/draft');
var extend = require('extend');
var Campsi = require('campsi-core');
var createAppEvent = require('../../../lib/campsi-app/event');

resources.patchRouter(router);

var returnId = function (item) {
    if (typeof item === 'string') {
        return item;
    }
    return mongoose.Types.ObjectId(item._id);
};

router.put('/projects/:project', function (req, res) {

    var project = req.project;

    var event = createAppEvent(req);
    event.previousValue = req.project.toObject();

    if (typeof req.body.title !== 'undefined') {
        project.title = req.body.title;
    }

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
        project.identifier = slug(req.body.identifier);
    }
    if (typeof req.body.deployments !== 'undefined') {
        project.deployments = req.body.deployments;
    }
    if (typeof req.body.websiteUrl !== 'undefined') {
        project.websiteUrl = req.body.websiteUrl;
    }

    project.save(function (err, result) {
        if(err){
            res.status(500);
            return res.json(err);
        }
        res.json(result.toObject());
        Campsi.eventbus.emit('project:update', event);
    });
});

router.put('/projects/:project/collections/:collection', function (req, res) {
    var collection = req.collection;

    var event = createAppEvent(req);
    event.previousValue = req.collection.toObject();

    if (typeof req.body.name !== 'undefined') {
        collection.name = req.body.name;
        if (typeof req.body.identifier !== 'undefined') {
            collection.identifier = slug(req.body.identifier);
        } else if (typeof collection.identifier === 'undefined') {
            collection.identifier = slug(req.body.name);
        }
    }

    collection.name = req.body.name || collection.name;

    if (typeof req.body.fields !== 'undefined') {
        collection.fields = req.body.fields;
        collection.hasFields = req.body.fields.length > 0;
    }
    if (typeof req.body.icon !== 'undefined') {
        collection.icon = req.body.icon;
    }

    if (typeof req.body.templates !== 'undefined') {
        collection.templates = req.body.templates;
    }

    if (typeof req.body.entries !== 'undefined') {
        collection.entries = req.body.entries.map(returnId);
    }

    collection.save(function (err, result) {
        res.json(result.toObject());
        Campsi.eventbus.emit('collection:update', event);
    });
});

router.put('/projects/:project/collections/:collection/entries/:entry', function (req, res) {

    var entry = req.entry;

    var event = createAppEvent(req);
    event.previousValue = req.entry.toObject();

    if (typeof req.body.data !== 'undefined') {
        entry.markModified('data');
        entry.data = req.body.data;
    }

    entry.modifiedAt = new Date();

    entry.save(function (err, result) {
        if (req.body._draft) {
            Draft.remove({_id: req.body._draft}, function () {
                res.json(result.toObject());
            });

            Campsi.eventbus.emit('draft:delete', {
                project: req.project._id.toString(),
                collection: req.collection._id.toString(),
                draft: req.body._draft,
                user: req.user._id.toString()
            });
        } else {
            res.json(result.toObject());
        }

        Campsi.eventbus.emit('entry:update', event);
    });
});

router.put('/projects/:project/collections/:collection/drafts/:draft', function (req, res) {

    var draft = req.draft;

    var event = createAppEvent(req);
    event.previousValue = req.draft.toObject();

    if (typeof req.body.data !== 'undefined') {
        draft.markModified('data');
        draft.data = req.body.data;
    }

    draft.modifiedAt = new Date();

    draft.save(function (err, result) {
        res.json(result.toObject());
        Campsi.eventbus.emit('draft:update', event);
    });
});

router.put('/users/me', function (req, res) {

    var event = createAppEvent(req);
    event.previousValue = req.user.toObject();

    extend(req.user, req.body);
    req.user.save(function () {
        res.json(req.user);
        Campsi.eventbus.emit('user:update', event);
    });
});

module.exports = router;
