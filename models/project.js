var mongoose = require('mongoose');

var User = require('./user');
var Collection = require('./collection');
var config = require('../config');
var Campsi = require('campsi');
var async = require('async');


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
    var self = this;

    if (typeof user === 'undefined') {
        self.find({demo: true}).select('_id title icon identifier demo').exec(cb);
    } else {
        var projectHash = {};
        var projectsArray = [];
        User.findOne({_id: user._id}).select('projects').exec(function (err, populatedUser) {
            async.forEach(populatedUser.projects, function (p, next) {
                projectsArray.push(p._id);
                self.findOne({_id: p._id}).select('_id title icon identifier demo').exec(function (err, project) {
                    project.roles = p.roles;
                    projectHash[project._id.toString()] = project;
                    next();
                });
            }, function () {
                cb(null, projectsArray.map(function (_id) {
                    return projectHash[_id];
                }));
            });
        });
    }
};

schema.set('toObject', {
    getters: true,
    virtuals: true
});

schema.virtual('url').get(function () {
    return config.host + '/api/v1' + Campsi.url(this);
});

schema.virtual('roles').set(function (roles) {
    this.__roles = roles;
});

schema.virtual('roles').get(function () {
    return this.__roles;
});
module.exports = mongoose.model('Project', schema);

