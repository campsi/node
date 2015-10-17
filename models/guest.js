var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    email: {type: String, required: true},
    invitations: [{
        _inviter: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        _project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
        roles: [String]
    }]
});

schema.index({email: 1}, {unique: true});

module.exports = mongoose.model('Guest', schema);
