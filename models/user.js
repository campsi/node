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

schema.statics.findOrCreate = function(profile, cb){
    var model = this;

    model.find({id: profile.id}).exec(function (err, results) {
        if (results.length === 0) {
            model.create(profile, cb);
        } else {
            cb(err, results[0]);
        }
    });
};

module.exports = mongoose.model('User', schema);

