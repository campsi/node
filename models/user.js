var mongoose = require('mongoose');

var schema =  new mongoose.Schema({
    user_id: String
});

module.exports = mongoose.model('User', schema);

