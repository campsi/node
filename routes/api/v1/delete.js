var router = require('express').Router();
var resources = require('../../../middleware/resources');
var Project = require('../../../models/project');
var Collection = require('../../../models/collection');
var User = require('../../../models/user');
var Guest = require('../../../models/guest');
var Entry = require('../../../models/entry');
var Draft = require('../../../models/draft');
var Campsi = require('campsi-core');
var createAppEvent = require('../../../lib/campsi-app/server/event');

resources.patchRouter(router);

router.put('/projects/:project*', function(req, res, next){
    if(req.user.getRolesForProject(req.project).length === 0){
        return res.status(401).json({error: true, message: 'unauthorized'});
    }
    next();
});

router.delete('/projects/:project', function (req, res) {

    Project.remove({_id: req.project._id}, function (err) {
        if (err) {
            res.status(500);
            return res.json(err);
        }

        res.json({});

        Campsi.eventbus.emit('project:delete', createAppEvent(req));
    });
});

router.delete('/projects/:project/users/:user', function (req, res) {
    User.findOne({_id: req.params.user}, function (err, user) {
        if (err) {
            res.status(404);
            return res.json({error: true});
        }


        user.removeFromProject(req.project._id);
        user.save(function () {
            res.end();
        });
    });
});

router.delete('/projects/:project/guests/:guest', function (req, res) {
    Guest.findOne({_id: req.params.guest}, function (err, guest) {
        if (err) {
            res.status(404);
            return res.json({error: true});
        }

        guest.cancelInvitation(req.project._id);
        guest.save(function () {
            res.end();
        });
    });
});

router.delete('/projects/:project/collections/:collection', function (req, res) {
    Collection.remove({_id: req.collection._id}, function (err) {
        if (err) {
            res.status(500);
            return res.json(err);
        }

        res.json({});

        Campsi.eventbus.emit('collection:delete', createAppEvent(req));
    });
});

router.delete('/projects/:project/collections/:collection/entries/:entry', function (req, res) {
    Entry.remove({_id: req.entry._id}, function (err) {
        if (err) {
            res.status(500);
            return res.json(err);
        }

        res.json({});

        Campsi.eventbus.emit('entry:delete', createAppEvent(req));
    });
});


router.delete('/projects/:project/collections/:collection/drafts/:draft', function (req, res) {
    Draft.remove({_id: req.draft._id}, function (err) {
        if (err) {
            res.status(500);
            return res.json(err);
        }

        res.json({});

        Campsi.eventbus.emit('drafts:delete', createAppEvent(req));
    });
});

module.exports = router;
