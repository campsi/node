var mongoose = require('mongoose');

var User = require('./user');
var Collection = require('./collection');

var schema = new mongoose.Schema({
    title: String,
    icon: {
        uri: String
    },
    admins: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    designers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    collections: [{type: mongoose.Schema.Types.ObjectId, ref: 'Collection'}]
});

module.exports = mongoose.model('Project', schema);

