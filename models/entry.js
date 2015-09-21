var mongoose = require('mongoose');

var entry =  new mongoose.Schema({
    _collection: {type: mongoose.Schema.Types.ObjectId, ref: 'Collection'},
    index: Number,
    data: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('Entry', entry);