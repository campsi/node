var mongoose = require('mongoose');
var Draft = require('./draft');
var deepCopy = require('deepcopy');

var schema = new mongoose.Schema({
    _project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
    _creator: String,
    name: String,
    identifier: String,
    icon: {
        uri: String
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
}, {id: false});

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


schema.methods.getReferenceFields = function (fields, path) {
    var referencesFields = [];
    var self = this;
    if (typeof fields === 'undefined') {
        fields = this.fields;
    }

    fields.forEach(function (field) {

        var fieldPath = (path) ? path + '/' + field.name : field.name;

        if (field.type === 'campsi/reference') {
            var copy = deepCopy(field);
            copy.path = fieldPath;
            referencesFields.push(copy);
        }

        if (Array.isArray(field.fields)) {
            referencesFields.concat(self.getReferenceFields(field.fields), fieldPath);
        }

        if (field.items && Array.isArray(field.items.fields)){
            referencesFields.concat(self.getReferenceFields(field.items.fields), fieldPath);
        }
    });

    return referencesFields;

};
/*
 schema.methods.containsReferenceField = function (fields, contains) {

 if (typeof fields === 'undefined') {
 fields = this.fields;
 contains = false;
 }

 fields.forEach(function (field) {
 if (field.type === 'campsi/reference') {
 contains = true;
 }

 if(Array.isArray(field.fields)){
 //noinspection JSPotentiallyInvalidUsageOfThis
 this.containsReferenceField(field.fields, contains);
 }

 if(field.items && Array.isArray(field.items.fields)){
 //noinspection JSPotentiallyInvalidUsageOfThis
 this.containsReferenceField(field.items.fields, contains);
 }
 });

 return contains;
 };

 */

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

module.exports = mongoose.model('Collection', schema);



