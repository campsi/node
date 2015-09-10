var express = require('express');
var router = express.Router();
var cheerio = require('cheerio');
var Campsi = require('campsi');

var User = require('../../../models/user');
var Project = require('../../../models/project');
var Collection = require('../../../models/collection');
var Item = require('../../../models/item');


/* GET home page. */
router.get('/', function (req, res, next) {
    //admin contains

    Collection.find().exec(function (err, results) {
        res.json(results);
    });
});

router.post('/', function (req, res, next) {

    var collection = req.body;
    collection.user_id = req.user.sub;

    Collection.create(collection, function (err, collection) {
        res.json(collection);
    });

});

router.put('/:id', function (req, res, next) {
    Collection.findOne(req.params.id, function (err, collection) {
        collection.update(req.body);
        res.json(collection);
    });
});

router.delete('/:id', function (req, res, next) {
    Collection.findByIdAndRemove(req.params.id, function (err, collection) {
        res.json(collection);
    });
});

router.get('/:id', function (req, res, next) {

    Collection.findById(req.params.id, function (err, collection) {
        res.json(collection.toObject());
    });
});

router.get('/:id/collection-designer-component', function (req, res, next) {
    Collection.findById(req.params.id, function (err, collection) {
        Campsi.create('campsi/collection-designer', undefined, collection.toObject().fields, function (collectionDesignerComponent) {
            res.send(cheerio.html(collectionDesignerComponent.render()));
        });
    });
});

router.get('/:id/items', function (req, res, next) {
    //Item.find({_collection: req.params.id}).populate('_collection').exec(function(err, items){
    Item.find({_collection: req.params.id})
        .sort({index: 'asc'})
        .select('data')
        .exec(function (err, items) {
                  res.json(items);
              });
});

router.post('/:id/items', function (req, res, next) {
    Item.create(req.body, function (err, item) {
        res.json(item);
    });
});

router.get('/:id/items/:itemId', function (req, res, next) {
    Item.findById(req.params.itemId, function (err, item) {
        res.json(item);
    });
});


router.put('/:id/items/:itemId', function (req, res, next) {

    var updateItem = function (req, res) {
        Item.findById(req.params.itemId, function (err, item) {
            // reorder if isset body.index
            if (req.body.data) {
                item.markModified('data');
            }
            item.update(req.body, function (err, item) {
                if (err) {
                    res.json(err);
                } else {
                    res.json(item);
                }
            });
        });

    }

    if (req.body.index) {
        Item.update({
                _collection: {_id: req.params.id},
                index: {$gte: req.body.index}
            },
            {$inc: {index: 1}},
            {multi: true},
            function (err, update) {
                updateItem(req, res);
            })
    } else {
        updateItem(req, res);
    }
});

module.exports = router;
