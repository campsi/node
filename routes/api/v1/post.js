var router = require('express').Router();
var resources = require('../../../middleware/resources');
var Project = require('../../../models/project');
var Collection = require('../../../models/collection');
var Entry = require('../../../models/entry');
var Guest = require('../../../models/guest');
resources(router);

router.post('/projects', function (req, res, next) {
    Project.create(req.body, function (project) {
        res.json(project.toObject());
    });
});

router.post('/projects/:project/collections', function (req, res, next) {
    Collection.create({
        _project: req.project._id,
        name: 'New collection',
        fields: []
    }, function (err, collection) {
        req.project.collections.push(collection._id);
        req.project.save(function () {
            res.json(collection);
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

    //User.findOne({email: req.body.email}, function (err, user) {
    //
    //});

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
        });
    });
});
module.exports = router;
