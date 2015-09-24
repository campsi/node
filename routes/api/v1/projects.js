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

var getProjectsQuery = function (selector) {
    return Project
        .find(selector || {})
        .populate({
            path: 'collections',
            select: 'name _id'
        })
        .populate({
            path: 'admins',
            select: 'name picture nickname _id'
        })
        .populate({
            path: 'designers',
            select: 'name picture nickname _id'
        });
};

/* GET home page. */
router.get('/', function (req, res, next) {
    ProjectService.find({/*userId: sdsg*/}, res.json);
});

router.get('/:id', function (req, res, next) {
    console.info(req.params.id);
    ProjectService.find({_id: new ObjectId(req.params.id) }, function(projects){
        if(typeof projects[0] !== 'undefined'){
            res.json(projects[0]);
        } else {
            res.status(404).json({});
        }
    });
});

router.post('/', function (req, res, next) {
    Project.create(req.body, function (err, collection) {
        res.json(collection);
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
            project.collections = req.body.collections.map(returnId);
        }
        if (typeof req.body.icon !== 'undefined') {
            project.icon = req.body.icon;
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
