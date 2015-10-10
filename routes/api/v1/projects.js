var express = require('express');
var router = express.Router();

var User = require('../../../models/user');
var Project = require('../../../models/project');
var Collection = require('../../../models/collection');
var Item = require('../../../models/entry');

var Campsi = require('campsi');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var ProjectService = require('../../../services/project');

var ObjectId = mongoose.Types.ObjectId;

/* GET home page. */
router.get('/', function (req, res, next) {
    ProjectService.find({/*userId: sdsg*/}, function (projects) {
        res.json(projects)
    });
});

router.post('/:id/collections', function (req, res, next) {
    ProjectService.createCollection(req.params.id, function(collection){
        res.json(collection);
    });
});


router.post('/', function (req, res, next) {
    ProjectService.create(req.body, function(project){
       res.json(project);
    });
});

router.put('/:id', function (req, res, next) {

    Project.findOne({'_id': req.params.id}, function (err, project) {

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
});

router.delete('/:id', function (req, res, next) {
    Project.findByIdAndRemove(req.params.id, function (err, collection) {
        res.json(collection);
    });
});


module.exports = router;
