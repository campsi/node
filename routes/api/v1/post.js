var router = require('express').Router();
var resources = require('../../../middleware/resources');
var Project = require('../../../models/project');
var Collection = require('../../../models/collection');
var Entry = require('../../../models/entry');
var Guest = require('../../../models/guest');
var User = require('../../../models/user');
var slug = require('slug');

// todo use process.env
var config = require('../../../config');
var sendgrid = require('sendgrid')(config.sendgrid_api_key);

resources(router);

var sendInvitationEmail = function (guest) {
    sendgrid.send({
        to: guest.email,
        from: 'invitations@campsi.io',
        subject: 'Your contribution is wanted',
        text: 'You\'re invited to contribute. http://campsi.io/invitation/' + guest._id
    }, function (err, json) {
        if (err) {
            return console.error(err);
        }
        console.log(json);
    });
};

router.post('/projects', function (req, res, next) {
    if (req.user) {

        var projectPayload = req.body;
        projectPayload.admins = [req.user._id];
        projectPayload.designers = [req.user._id];
        projectPayload.identifier = slug(projectPayload.title);

        Project.create(projectPayload, function (err, project) {
            if (err) {
                res.status(400);
                res.json(err);
            } else {
                res.json(project.toObject());
            }
        });

    } else {
        res.status(401);
        res.json({});
    }
});

router.post('/projects/:project/collections', function (req, res, next) {
    Collection.create({
        _project: req.project._id,
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

router.post('/projects/:project/collections/:collection/entries', function (req, res, next) {
    Entry.create({
        _collection: req.collection._id,
        data: req.body.data
    }, function (err, entry) {
        req.collection.entries.push(entry._id);
        req.collection.save(function () {
            res.json(entry);
        });
    });
});

router.post('/projects/:project/invitation', function (req, res, next) {

    User.findOne({email: req.body.email}, function (err, user) {

        if (user) {

            var roles = req.body.roles;

            if (roles.indexOf('admin') !== -1) {
                req.project.addUser('admins', req.user._id);
            }

            if (roles.indexOf('designer') !== -1) {
                req.project.addUser('designers', req.user._id);
            }

            req.project.save(function () {
                res.json(existingUser);
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
