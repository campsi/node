var router = require('express').Router();
var resources = require('../../../middleware/resources');

var Project = require('../../../models/project');
var Collection = require('../../../models/collection');
var Entry = require('../../../models/entry');
var Draft = require('../../../models/draft');
var Guest = require('../../../models/guest');
var User = require('../../../models/user');
var Campsi = require('campsi-core');
var slug = require('slug');

// todo use process.env
var config = require('../../../config');
var slugOptions = config.slug;
var sendgrid = require('sendgrid')(config.sendgrid_api_key);
var i18n = require('i18n');
var emailValidator = require('email-validator');

var createAppEvent = require('../../../lib/campsi-app/server/event');

resources.patchRouter(router);

var sendInvitationEmailToGuest = function (locale, guest, inviter) {
    sendInvitation(
        locale,
        guest.email,
        inviter,
        config.host + '/invitation/' + guest._id
    );
};

var sendInvitationEmailToUser = function (locale, user, inviter, project) {
    sendInvitation(
        user.locale || locale,
        user.getEmail(),
        inviter,
        config.host + '/projects/' + project.identifier || project._id
    );
};

var sendInvitation = function (locale, to, from, url) {
    sendgrid.send({
        to: to,
        from: 'support@campsi.io',
        subject: i18n.__({message: 'mail.invitation.subject', locale: locale}),
        text: i18n.__({message: 'mail.invitation.message', locale: locale}) + url
    }, function (err) {
        if (err) {
            return console.error(err);
        }
    });

    console.info("send invite to", to, "from", from.nickname, "locale", locale, "url", url);

};

router.post('/projects', function (req, res) {
    if (req.user) {

        var projectPayload = {
            title: req.body.title,
            identifier: req.body.identifier,
            icon: req.body.icon || {},
            notes: req.body.notes
        };

        if (!projectPayload.identifier) {
            projectPayload.identifier = slug(String(projectPayload.title), slugOptions);
        }

        Project.identifierExists(projectPayload.identifier, function (exists) {

            if (exists) {
                delete projectPayload.identifier;
            }

            Project.create(projectPayload, function (err, project) {
                if (err) {
                    res.status(400);
                    res.json(err);
                } else {
                    req.project = project;
                    req.user.addToProject(project._id, ['admin', 'designer']);
                    req.user.save(function (/*err, data*/) {
                        res.json(project.toObject());
                        Campsi.eventbus.emit('project:create', createAppEvent(req));
                    });
                }
            });
        });


    } else {
        res.status(401);
        res.json({});
    }
});


router.post('/projects/:project/collections', function (req, res) {

    if (req.query.template) {
        req.project.createCollectionFromTemplate(req.query.template, function (err, collection) {
            res.json(collection);
            Campsi.eventbus.emit('collection:create:fromTemplate', createAppEvent(req));
        });
        return;
    }

    var payload = {
        name: req.body.name,
        identifier: req.body.identifier,
        fields: req.body.fields || []
    };

    if (!payload.identifier) {
        payload.identifier = slug(String(payload.name), slugOptions);
    }

    Collection.create({
        _project: req.project._id,
        name: payload.name,
        identifier: payload.identifier,
        fields: payload.fields
    }, function (err, collection) {
        req.project.collections.push(collection._id);
        var collectionObject = collection.toObject();
        collectionObject.__project = req.project.identity();
        req.project.save(function () {
            res.json(collectionObject);
            req.collection = collection;
            Campsi.eventbus.emit('collection:create', createAppEvent(req));
        });
    });
});

router.post('/projects/:project/collections/:collection/drafts', function (req, res) {
    Draft.create({
        _collection: req.collection._id,
        _user: req.user._id,
        _entry: req.body._entry,
        createdAt: new Date(),
        data: req.body.data
    }, function (err, draft) {
        res.json(draft.toObject());
        req.draft = draft;
        Campsi.eventbus.emit('draft:create', createAppEvent(req));
    });
});

router.post('/projects/:project/collections/:collection/entries', function (req, res) {
    Entry.create({
        _collection: req.collection._id,
        createdAt: new Date(),
        data: req.body.data
    }, function (err, entry) {

        var send = function () {
            req.collection.entries.push(entry._id);
            req.collection.save(function () {
                res.json(entry);
                req.entry = entry;
                Campsi.eventbus.emit('entry:create', createAppEvent(req));
            });
        };

        if (req.body._draft) {
            Draft.remove({_id: req.body._draft}, function (/* err */) {
                send();
            });
        } else {
            send();
        }

    });
});

router.post('/projects/:project/invitation', function (req, res) {

    if (emailValidator.validate(req.body.email) === false) {
        return res.status(400).json({error: true, message: 'invalid email'});
    }

    if (req.body.roles.length === 0) {
        return res.status(400).json({error: true, message: 'no roles checked'});
    }

    createAppEvent(req).roles = req.body.roles;

    User.findOne({'emails.value': req.body.email}, function (err, user) {
        if (user) {

            createAppEvent(req).invitedUser = {
                _id: user._id.toString(),
                nickname: user.nickname
            };


            user.addToProject(req.project._id, req.body.roles);
            user.save(function () {
                res.json(user);
                sendInvitationEmailToUser(req.locale, user, req.user, req.project, req.body.message);
                Campsi.eventbus.emit('user:addedToProject', createAppEvent(req));
            });
        } else {
            Guest.findOne({email: req.body.email}, function (err, guest) {
                var invitation = {
                    _project: req.project._id,
                    _inviter: req.user._id,
                    roles: req.body.roles,
                    message: req.body.message
                };
                if (guest === null) {
                    guest = new Guest({
                        email: req.body.email,
                        invitations: [invitation]
                    });
                } else {
                    guest.invitations.push(invitation)
                }

                guest.save(function (err, guest) {
                    res.json(guest);
                    sendInvitationEmailToGuest(req.locale, guest, req.user);

                    req.guest = {
                        _id: guest._id.toString(),
                        email: guest.email
                    };

                    Campsi.eventbus.emit('guest:invitedToProject', createAppEvent(req));
                });
            });
        }

    });
});

module.exports = router;
