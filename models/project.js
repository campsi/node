module.exports = (function () {

    var config = require('../config');
    var mongoose = require('mongoose');
    var Campsi = require('campsi');
    var async = require('async');

    var User = require('./user');
    var Guest = require('./guest');
    var Collection = require('./collection');

    var schema = new mongoose.Schema({
        title: String,
        identifier: String,
        demo: Boolean,
        icon: {
            uri: String
        },
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
                    self.findOne({_id: p._id}).select('_id title icon identifier demo').exec(function (err, project) {
                        if (project) {
                            project.roles = p.roles;
                            projectsArray.push(p._id);
                            projectHash[project._id.toString()] = project;
                        }
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

    schema.methods.getUsers = function (cb) {
        User.find({
            projects: {
                $elemMatch: {
                    _id: this._id
                }
            }
        }).select("displayName _id email picture nickname").exec(cb);
    };

    schema.methods.getGuests = function (cb) {
        Guest.find({
            _invitation: {
                $elemMatch: {
                    _project: this._id
                }
            }
        }).exec(cb);
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

    return mongoose.model('Project', schema);
})();



