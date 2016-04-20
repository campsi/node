'use strict';
var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    _collection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection'
    },
    data: mongoose.Schema.Types.Mixed,
    createdAt: Date,
    modifiedAt: Date
}, { id: false });
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
    return this._draft;
});
schema.virtual('draft').set(function (draft) {
    this._draft = draft;
});
schema.set('toObject', {
    getters: true,
    virtuals: true
});
module.exports = mongoose.model('Entry', schema);