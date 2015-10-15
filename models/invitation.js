var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    invitedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    email: {type: String, required: true},
    projects: [{
        _id: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
        roles: [String]
    }]
});

schema.index({email: 1}, {unique: true});

module.exports = mongoose.model('Invitation', schema);
