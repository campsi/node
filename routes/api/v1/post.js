var router = require('express').Router();
var resources = require('../../../middleware/resources');
var Project = require('../../../models/project');
var Collection = require('../../../models/collection');
var Entry = require('../../../models/entry');
var Draft = require('../../../models/draft');
var Guest = require('../../../models/guest');
var User = require('../../../models/user');
var slug = require('slug');

// todo use process.env
var config = require('../../../config');
var sendgrid = require('sendgrid')(config.sendgrid_api_key);

resources.patchRouter(router);

var sendInvitationEmail = function (guest) {
    sendgrid.send({
        to: guest.email,
        from: 'invitations@campsi.io',
        subject: 'Your contribution is wanted',
        text: 'You\'re invited to contribute. ' + config.host + '/invitation/' + guest._id
    }, function (err, json) {
        if (err) {
            return console.error(err);
        }
        console.log(json);
    });
};

router.post('/projects', function (req, res, next) {
    if (req.user) {

        var projectPayload = {
            title: req.body.title || req.context.translate('api.projects.defaultTitle'),
            identifier: req.body.identifier,
            icon: req.body.icon || {}
        };

        if(typeof projectPayload.identifier === 'undefined'){
            projectPayload.identifier = slug(String(projectPayload.title));
        }

        Project.create(projectPayload, function (err, project) {
            if (err) {
                res.status(400);
                res.json(err);
            } else {
                req.user.addToProject(project._id, ['admin', 'designer']);
                req.user.save(function (err, data) {
                    res.json(project.toObject());
                });
            }
        });

    } else {
        res.status(401);
        res.json({});
    }
});

router.post('/projects/:project/collections', function (req, res, next) {

    if(req.query.template){
        console.info("create collection from template", req.query.template);
        req.project.createCollectionFromTemplate(req.query.template, function(err, collection){
            res.json(collection);
        });
        return;
    }

    Collection.create({
        _project: req.project._id,
        name: req.body.name,
        identifier: (typeof req.body.identifier === 'undefined' || req.body.identifier === '') ? slug(req.body.name) : slug(req.body.identifier),
        fields: []
    }, function (err, collection) {
        req.project.collections.push(collection._id);
        var collectionObject = collection.toObject();
        collectionObject.__project = req.project.identity();
        req.project.save(function () {
            res.json(collectionObject);
        });
    });
});

router.post('/projects/:project/collections/:collection/drafts', function (req, res, next) {
    Draft.create({
        _collection: req.collection._id,
        _user: req.user._id,
        _entry: req.body._entry,
        data: req.body.data
    }, function (err, draft) {
        res.json(draft.toObject());
    });
});

router.post('/projects/:project/collections/:collection/entries', function (req, res, next) {
    Entry.create({
        _collection: req.collection._id,
        data: req.body.data
    }, function (err, entry) {

        var send = function () {
            req.collection.entries.push(entry._id);
            req.collection.save(function () {
                res.json(entry);
            });
        };

        if (req.body._draft) {
            Draft.remove({_id: req.body._draft}, function (err) {
                send();
            });
        } else {
            send();
        }

    });
});

router.post('/projects/:project/invitation', function (req, res, next) {

    User.findOne({'emails.value': req.body.email}, function (err, user) {

        if (user) {
            user.addToProject(req.project._id, req.body.roles);
            user.save(function () {
                res.json(user);
            });
        } else {
            Guest.findOne({email: req.body.email}, function (err, guest) {
                if (guest === null) {
                    guest = new Guest({
                        email: req.body.email,
                        invitations: [{
                            _project: req.project._id,
                            _inviter: req.user._id,
                            roles: req.body.roles
                        }]
                    });
                } else {
                    guest.invitations.push({
                        _project: req.project._id,
                        _inviter: req.user._id,
                        roles: req.body.roles
                    })
                }

                guest.save(function (err, guest) {
                    res.json(guest);
                    sendInvitationEmail(guest);
                });
            });
        }

    });
});
module.exports = router;
