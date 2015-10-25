var mongoose = require('mongoose');

module.exports = (function () {
    var schema = new mongoose.Schema({
        _collection: {type: mongoose.Schema.Types.ObjectId, ref: 'Collection'},
        data: mongoose.Schema.Types.Mixed
    });

    schema.methods.identity = function () {
        return {
            _id: this._id.toString()
        }
    };

    schema.virtual('__collection').get(function () {
        return this.___collection;
    });

    schema.virtual('__collection').set(function (collection) {
        return this.___collection = collection;
    });

    schema.virtual('drafts').get(function () {
        return this._drafts;
    });

    schema.virtual('drafts').set(function (drafts) {
        return this._drafts = drafts;
    });

    schema.set('toObject', {
        getters: true,
        virtuals: true
    });

    return mongoose.model('Entry', schema);
})();
