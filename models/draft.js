'use strict';
var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    _collection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection'
    },
    _entry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entry'
    },
    _user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: Date,
    modifiedAt: Date,
    data: mongoose.Schema.Types.Mixed
}, { id: false });
schema.statics.findDraftsInCollectionForUser = function (collection, user, cb) {
    this.find({
        _collection: collection._id,
        _user: user._id
    }).exec(cb);
};
schema.methods.identity = function () {
    return { _id: this._id.toString() };
};
schema.virtual('__collection').get(function () {
    return this.___collection;
});
schema.virtual('__collection').set(function (collection) {
    this.___collection = collection;
});
schema.virtual('draft').get(function () {
    return true;
});
schema.set('toObject', {
    getters: true,
    virtuals: true
});
module.exports = mongoose.model('Draft', schema);