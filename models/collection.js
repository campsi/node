var mongoose = require('mongoose');
var config = require('../config');
var Draft = require('./draft');

module.exports = (function () {

    var schema = new mongoose.Schema({
        _project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
        _creator: String,
        name: String,
        identifier: String,
        icon: {
            uri: String,
        },
        date: Date,
        fields: [mongoose.Schema.Types.Mixed],
        templates: [{
            identifier: String,
            markup: String,
            scope: String
        }],
        hasFields: Boolean,
        entries: [{type: mongoose.Schema.Types.ObjectId, ref: 'Entry'}]
    });

    schema.index({_project: 1, identifier: 1}, {unique: true});

    schema.methods.identity = function () {
        return {
            _id: this._id.toString(),
            __project: this.__project,
            identifier: this.identifier,
            name: this.name
        }
    };

    schema.set('toObject', {
        getters: true,
        virtuals: true
    });

    schema.methods.getEntriesAndDrafts = function (user, cb) {
        var instance = this;
        instance.populate('entries', function (err, doc) {

            if (typeof user === 'undefined') {
                return cb(null, {entries: doc.entries, drafts: []});
            }

            Draft.findDraftsInCollectionForUser(instance, user, function (err, drafts) {
                var entriesById = {};
                doc.entries.forEach(function (e) {
                    entriesById[e._id.toString()] = e;
                });
                drafts.forEach(function (d) {
                    if (d._entry && typeof  entriesById[d._entry.toString()] !== 'undefined') {
                        entriesById[d._entry.toString()].draft = d._id.toString();
                    }
                });

                cb(null, {entries: doc.entries, drafts: drafts});
            });
        });
    };


    schema.methods.export = function (cb) {
        this.populate('entries', function (err, populated) {
            var collection = populated.toObject();
            collection.entries = collection.entries.map(function (e) {
                return {data: e.data};
            });

            collection.templates = collection.templates.map(function (t) {
                return {
                    markup: t.markup,
                    scope: t.scope,
                    identifier: t.identifier
                }
            });

            delete collection._id;
            delete collection.id;
            delete collection._project;
            delete collection.__v;
            delete collection.hasFields;

            cb(collection);
        })

    };

    return mongoose.model('Collection', schema);

})();


