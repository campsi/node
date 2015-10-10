var mongoose = require('mongoose');

var User = require('./user');
var Collection = require('./collection');

var schema = new mongoose.Schema({
    title: String,
    identifier: String,
    icon: {
        uri: String
    },
    admins: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    designers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    collections: [{type: mongoose.Schema.Types.ObjectId, ref: 'Collection'}]
});

schema.methods.identity = function(){
    return {
        _id: this._id.toString(),
        identifier: this.identifier,
        title: this.title
    }
};

schema.set('toObject', {
    getters: true,
    virtuals: true
});

module.exports = mongoose.model('Project', schema);

