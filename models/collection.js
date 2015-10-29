var mongoose = require('mongoose');
var config = require('../config');
var Campsi = require('campsi');
var Draft = require('./draft');
var Entry = require('./entry');

module.exports = (function () {

    var schema = new mongoose.Schema({
        _project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
        _creator: String,
        name: String,
        identifier: String,
        date: Date,
        fields: [mongoose.Schema.Types.Mixed],
        templates: [{
            identifier: String,
            markup: String,
            scope: String
        }],
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

        if(typeof user === 'undefined'){
            return cb(null, this.entries);
        }
        var instance = this;
        var items = [];
        Draft.findDraftsInCollectionForUser(this, user, function (err, drafts) {

            instance.populate('entries', function (err, doc) {
                var entriesById = {};
                doc.entries.forEach(function (e) {
                    entriesById[e._id.toString()] = e;
                });
                drafts.forEach(function (d) {
                    if (d._entry) {
                        entriesById[d._entry.toString()].draft = d;
                    } else {
                        items.push(d);
                    }
                });

                items = items.concat(doc.entries);
                cb(null, items);
            });
        });
    };

    return mongoose.model('Collection', schema);

})();


