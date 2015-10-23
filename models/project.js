var mongoose = require('mongoose');

var User = require('./user');
var Collection = require('./collection');
var config = require('../config');
var Campsi = require('campsi');


var schema = new mongoose.Schema({
    title: String,
    identifier: String,
    demo: Boolean,
    icon: {
        uri: String
    },
    admins: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    designers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    collections: [{type: mongoose.Schema.Types.ObjectId, ref: 'Collection'}]
});

schema.index({identifier: 1}, {unique: true});

schema.methods.identity = function () {
    return {
        _id: this._id.toString(),
        identifier: this.identifier,
        title: this.title
    }
};


schema.methods.addUser = function (role, userId) {

    var stringId = userId.toString();
    var exists = false;
    this[role].forEach(function (a) {
        if (a.toString() === stringId) {
            exists = true;
        }
    });
    if (!exists) {
        this[role].push(userId);
    }
};

schema.statics.list = function (user, cb) {
    var query;
    if (typeof user === 'undefined') {
        query = {
            demo: true
        }
    } else {
        query = {
            $or: [
                {
                    designers: {
                        $elemMatch: {
                            $eq: user._id
                        }
                    }
                }, {
                    admins: {
                        $elemMatch: {
                            $eq: user._id
                        }
                    }
                }]
        }
    }

    this.find(query).select('_id title icon identifier demo').exec(cb);
};

schema.set('toObject', {
    getters: true,
    virtuals: true
});

schema.virtual('url').get(function() {
    return config.host + '/api/v1' + Campsi.url(this);
});

module.exports = mongoose.model('Project', schema);

