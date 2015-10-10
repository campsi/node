var mongoose = require('mongoose');

var schema =  new mongoose.Schema({
    _collection: {type: mongoose.Schema.Types.ObjectId, ref: 'Collection'},
    index: Number,
    data: mongoose.Schema.Types.Mixed
});

schema.methods.identity = function(){
    return {
        _id: this._id.toString()
    }
};

schema.virtual('__collection').get(function() {
    return this.___collection;
});

schema.virtual('__collection').set(function(collection) {
    return this.___collection = collection;
});

schema.set('toObject', {
    getters: true,
    virtuals: true
});

module.exports = mongoose.model('Entry', schema);