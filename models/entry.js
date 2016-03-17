var mongoose = require('mongoose');

module.exports = (function () {
    var schema = new mongoose.Schema({
        _collection: {type: mongoose.Schema.Types.ObjectId, ref: 'Collection'},
        data: mongoose.Schema.Types.Mixed,
        createdAt: Date,
        modifiedAt: Date
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

    schema.virtual('draft').get(function () {
        return this._draft;
    });

    schema.virtual('draft').set(function (draft) {
        return this._draft = draft;
    });

    schema.set('toObject', {
        getters: true,
        virtuals: true
    });

    return mongoose.model('Entry', schema);
})();
