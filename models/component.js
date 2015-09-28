var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String,
    icon: String,
    category: String
});

module.exports = mongoose.model('Component', schema);

