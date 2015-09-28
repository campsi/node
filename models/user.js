var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    provider: String,
    displayName: String,
    id: String,
    name: {
        familyName: String,
        givenName: String
    },
    emails: [{value: String}],
    picture: String,
    nickname: String,
    identities: [{
        user_id: String,
        provider: String,
        connection: String,
        isSocial: Boolean
    }]
});

module.exports = mongoose.model('User', schema);

