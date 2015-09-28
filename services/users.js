var User = require('../models/user');

var UserService = function () {

};

UserService.prototype.getOrCreate = function (profile, cb) {
    var instance = this;
    User.find({'user_id': profile.id}).exec(function (err, results) {
        if (results.length === 0) {
            instance.create(profile, cb);
        } else {
            cb(results[0]);
        }
    });
};

UserService.prototype.create = function (profile, cb) {
    User.create(profile, function (err, user) {
        console.info(err, user);
        //todo push event, send email, etc.
        cb(user);
    });
};

module.exports = new UserService();