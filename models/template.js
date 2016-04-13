var mongoose = require('mongoose');

var Collection = require('./collection');
var Entry = require('./entry');
var async = require('async');

var schema = new mongoose.Schema({
    name: String,
    identifier: String,
    tags: [String],
    locale: String,
    icon: {
        uri: String,
        src: String,
        name: String,
        mime: String,
        size: Number,
        width: Number,
        height: Number
    },
    entries: [{data: mongoose.Schema.Types.Mixed}],
    fields: [mongoose.Schema.Types.Mixed]
}, {id: false});

schema.methods.createCollection = function (project, cb) {

    var instance = this;

    Collection.create({
        _project: project._id,
        name: this.name,
        identifier: this.identifier,
        fields: this.fields,
        entries: []
    }, function (err, collection) {
        async.forEachSeries(instance.entries, function (e, iterationCB) {
            Entry.create({
                data: e.data,
                _collection: collection._id
            }, function (err, entry) {
                collection.entries.push(entry._id);
                iterationCB();
            });
        }, function () {
            collection.save(function (err, collection) {
                project.collections.push(collection._id);
                project.save(function (err) {
                    cb(err, collection);
                });
            });
        });
    });
};

schema.index({name: 1}, {unique: true});
schema.index({identifier: 1}, {unique: true});
module.exports = mongoose.model('Template', schema);

