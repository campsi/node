var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    admins: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    name: String,
    phone: String,
    vatNumber: String,
    address: {
        line1: String,
        line2: String,
        line3: String,
        postCode: String,
        region: String,
        city: String,
        country: String
    }
});

module.exports = mongoose.model('Organization', schema);