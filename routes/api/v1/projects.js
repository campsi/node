var express = require('express');
var router = express.Router();

var User = require('../../../models/user');
var Project = require('../../../models/project');
var Collection = require('../../../models/collection');
var Item = require('../../../models/item');

var Campsi = require('campsi');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

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
    getProjectsQuery().exec(function (err, results) {
        res.json(results);
    });
});
/* GET home page. */
router.get('/list', function (req, res, next) {
    getProjectsQuery().exec(function (err, results) {
        Campsi.create('campsi/project-list', undefined, results, function (comp) {
            res.send(cheerio.html(comp.render()));
        });
    });
});


router.get('/:id', function (req, res, next) {
    getProjectsQuery({_id: req.params.id}).exec(function (err, projects) {
        if (projects) {
            var project = projects[0];
            res.json(project.toObject());
        } else {
            res.status(404).json({});
        }
    });
});

router.get('/:id/project-component', function (req, res, next) {
    getProjectsQuery({_id: req.params.id}).exec(function (err, projects) {
        if (projects) {

            var project = projects[0];
            Campsi.create('campsi/project', undefined, project.toObject(), function (projectComponent) {
                res.send(cheerio.html(projectComponent.render()));
            });

        } else {
            res.status(404).send('');
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
