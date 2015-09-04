var express = require('express');
var router = express.Router();

var User = require('../../../models/user');
var Project = require('../../../models/project');
var Collection = require('../../../models/collection');
var Item = require('../../../models/item');

var Campsi = require ('campsi');
var cheerio = require('cheerio');


var getProjectsQuery = function(selector){
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
          }) ;
};

/* GET home page. */
router.get('/', function (req, res, next) {
    getProjectsQuery().exec(function (err, results) {
        res.json(results);
    });
});


router.get('/:id', function (req, res, next) {

    getProjectsQuery({_id : req.params.id}).exec(function (err, projects) {
        var project = projects[0];
        res.format({
            'default': function(){
                res.json(project);
            },
            'application/json': function(){
                res.json(project);
            },
            'text/html': function(){
                Campsi.create('campsi/project', undefined, project.toObject(), function(projectComponent){
                    res.send(cheerio.html(projectComponent.render()));
                });
            }
        });
    });
});


router.post('/', function (req, res, next) {

    Project.create(req.body, function (err, collection) {
        res.json(collection);
    });

});

router.put('/:id', function (req, res, next) {
    Project.findOne(req.params.id, function (err, collection) {
        collection.update(req.body);
        res.json(collection);
    });
});

router.delete('/:id', function (req, res, next) {
    Project.findByIdAndRemove(req.params.id, function (err, collection) {
        res.json(collection);
    });
});


module.exports = router;
