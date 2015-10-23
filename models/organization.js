var mongoose = require('mongoose');

module.exports = (function(){
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

    return mongoose.model('Organization', schema);
})();
