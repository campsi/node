'use strict';
var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    name: String,
    category: String,
    vendor: String
}, { id: false });
schema.index({ name: 1 }, { unique: true });
module.exports = mongoose.model('Component', schema);