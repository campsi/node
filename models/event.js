'use strict';
var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    event: {
        type: String,
        required: true
    },
    data: mongoose.Schema.Types.Mixed,
    date: Date
}, { id: false });
module.exports = mongoose.model('Event', schema);