var express = require('express');
var router = express.Router();

var User = require('../../../models/user');
var Project = require('../../../models/project');
var Collection = require('../../../models/collection');
var Item = require('../../../models/item');


/* GET home page. */
router.get('/', function (req, res, next) {

    Project
        .find({})
        .populate({
            path: 'collections',
            select: 'name _id'
        })
        .populate({
            path: 'admins',
            select: 'name picture _id'
        })
        .populate({
            path: 'designers',
            select: 'name picture _id'
        })
        .exec(function (err, results) {
        res.json(results);
    });

});


router.get('/:id', function (req, res, next) {

    Project.findById(req.params.id, function (err, collection) {
        res.json(collection);
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
