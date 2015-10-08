var express = require('express');
var router = express.Router();
var cheerio = require('cheerio');
var Campsi = require('campsi');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var User = require('../../../models/user');
var Project = require('../../../models/project');
var Collection = require('../../../models/collection');
var Entry = require('../../../models/entry');

var Handlebars = require('handlebars');

var CollectionService = require('../../../services/collections');

/* GET home page. */
router.get('/', function (req, res, next) {
    //admin contains

    Collection.find().exec(function (err, results) {
        res.json(results);
    });
});

router.post('/', function (req, res, next) {

    var collection = req.body;

    Collection.create(collection, function (err, collection) {
        res.json(collection);
    });

});

router.put('/:id', function (req, res, next) {
    Collection.findOne({'_id': new ObjectId(req.params.id)}, function (err, collection) {

        collection.name = req.body.name || collection.name;

        if (typeof req.body.fields !== 'undefined') {
            collection.fields = req.body.fields;
        }

        if (typeof req.body.templates !== 'undefined') {
            collection.templates = req.body.templates;
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
    CollectionService.find({_id: ObjectId(req.params.id)}, function (collections) {
        if (collections.length > 0) {
            res.json(collections[0]);
        } else {
            res.status(404).json({error: 'no collection found'})
        }
    });
});

router.get('/:id/entries', function (req, res, next) {
    function sendJson(items) {
        res.json(items.map(function (item) {
            return item.toObject()
        }));
    }

    Entry.find({_collection: req.params.id})
        .sort({index: 'asc'})
        .exec(function (err, items) {
                  if (req.query.template) {
                      CollectionService.find({_id: req.params.id}, function (collections) {
                          var template;

                          collections[0].templates.forEach(function (tmpl) {
                              if (tmpl.identifier === req.query.template) {
                                  template = tmpl;
                              }
                          });


                          if (typeof template === 'undefined') {
                              return sendJson(items)
                          }

                          var compiledTemplate = Handlebars.compile(template.markup);
                          res.send(compiledTemplate({
                              entries: items.map(function (i) {
                                  return i.data
                              })
                          }));
                      });
                  } else {
                      sendJson(items)
                  }
              });
});

router.post('/:id/entries', function (req, res, next) {
    var entry = new Entry();
    entry._collection = req.params.id;
    entry.index = 0;
    entry.data = req.body.data;

    entry.save(function (err, item) {
        res.json(err || item);
    });
});

router.get('/:id/entries/:entryId', function (req, res, next) {
    Entry.findById(req.params.entryId, function (err, entry) {
        res.json(entry);
    });
});


router.put('/:id/entries/:entryId', function (req, res, next) {
    var exists = true;

    Entry.findById(req.params.entryId, function (err, entry) {
        if (typeof entry === 'undefined') {
            exists = false;
            return res.status(404).json({error: 'entry not found'});
        }

        var doUpdate = function () {

            if (req.body.data) {
                entry.markModified('data');
                entry.data = req.body.data;
            }

            entry.save(function (err, result) {
                entry.updateResult = result;
                res.json(err || entry);
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
                    doUpdate(req, res);
                })
        } else {
            doUpdate(req, res);
        }
    });
});

module.exports = router;
