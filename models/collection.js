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

    // todo delete (context)
    schema.virtual('__project').get(function () {
        return this.___project;
    });

    schema.virtual('url').get(function () {
        if (this.___project) {
            return config.host + '/api/v1' + Campsi.url(this.___project, this);
        }
        return "/collections/" + this.identifier || this._id.toString()
    });

    schema.virtual('__project').set(function (project) {
        return this.___project = project;
    });

    schema.set('toObject', {
        getters: true,
        virtuals: true
    });

    schema.methods.getEntriesAndDrafts = function (user, cb) {

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


