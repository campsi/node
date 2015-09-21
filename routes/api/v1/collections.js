var express = require('express');
var router = express.Router();
var cheerio = require('cheerio');
var Campsi = require('campsi');

var User = require('../../../models/user');
var Project = require('../../../models/project');
var Collection = require('../../../models/collection');
var Entry = require('../../../models/entry');


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
    Collection.findOne({'_id': req.params.id}, function (err, collection) {

        collection.name = req.body.name || collection.name;

        if (typeof req.body.fields !== 'undefined') {
            collection.fields = req.body.fields;
        }

        collection.save(function (err, result) {
            res.json(result);
        });
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
        Campsi.create('campsi/collection-designer', undefined, collection.toObject(), function (collectionDesignerComponent) {
            res.send(cheerio.html(collectionDesignerComponent.render()));
        });
    });
});

router.get('/:id/entries', function (req, res, next) {
    Entry.find({_collection: req.params.id})
        .sort({index: 'asc'})
        .select('data')
        .exec(function (err, items) {
                  res.json(items);
              });
});

router.post('/:id/entries', function (req, res, next) {
    Entry.create(req.body, function (err, item) {
        res.json(item);
    });
});
/* GET home page. */
router.get('/:id/entries/list', function (req, res, next) {
    Entry
        .find({_collection: req.params.id})
        .sort({index: 'asc'})
        .select('data')
        .exec(function (err, results) {
                  Campsi.create('campsi/entry-list', undefined, results, function (comp) {
                      res.send(cheerio.html(comp.render()));
                  });
              });
});

router.get('/:id/entries/:entryId', function (req, res, next) {
    Entry.findById(req.params.entryId, function (err, entry) {
        res.json(entry);
    });
});


router.put('/:id/entries/:entryId', function (req, res, next) {
    var updateEntry = function (req, res) {
        Entry.findById(req.params.entryId, function (err, entry) {
            // reorder if isset body.index
            if (req.body.data) {
                entry.markModified('data');
            }
            entry.update(req.body, function (err, result) {
                res.json(err || result);
            });
        });

    };

    if (req.body.index) {
        Entry.update({
                _collection: {_id: req.params.id},
                index: {$gte: req.body.index}
            },
            {$inc: {index: 1}},
            {multi: true},
            function (err, update) {
                updateEntry(req, res);
            })
    } else {
        updateEntry(req, res);
    }
});

module.exports = router;
