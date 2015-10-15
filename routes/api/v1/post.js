var router = require('express').Router();
var resources = require('../../../middleware/resources');
var Project = require('../../../models/project');
var Collection = require('../../../models/collection');
var Entry = require('../../../models/entry');
var Invitation = require('../../../models/invitation');
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
    }, function(err, entry){
        req.collection.entries.push(entry._id);
        req.collection.save(function(){
            res.json(entry);
        });
    });
});

router.post('/projects/:project/invitation', function(req, res, next){

    User.findOne({email: req.body.email}, function(err, user){

    });

    Invitation.findOne({email: req.body.email}, function(err, invitation){
        if(invitation === null){
            invitation = new Invitation({
                email: req.body.email,
                projects: [{
                    _id: req.project._id,
                    roles: req.body.roles
                }]
            });
        } else {
            var projectAlreadyReferenced = false;
            invitation.projects.forEach(function(p){
                if(p._id.toString() === req.project._id.toString()){
                    projectAlreadyReferenced = true;
                    req.body.roles.forEach(function(role){
                        if(p.roles.indexOf(role) === -1){
                            p.roles.push(role);
                        }
                    });
                }
            });

            if(!projectAlreadyReferenced){
                invitation.projects.push({
                    _id: req.project._id,
                    roles: req.body.roles
                })
            }
        }


        invitation.save(function(err, invitation){
            res.json(invitation);
            //console.info("done", err);
        });
    });
});
module.exports = router;
