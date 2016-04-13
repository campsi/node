var mongoose = require('mongoose');
var async = require('async');

var User = require('./user');
var Template = require('./template');

var schema = new mongoose.Schema({
    title: String,
    identifier: String,
    demo: Boolean,
    notes: String,
    url: String,
    icon: {
        uri: String,
        src: String,
        name: String,
        mime: String,
        size: Number,
        width: Number,
        height: Number
    },
    collections: [{type: mongoose.Schema.Types.ObjectId, ref: 'Collection'}]
}, {id: false});

schema.index({identifier: 1}, {unique: true});

schema.methods.identity = function () {
    return {
        _id: this._id.toString(),
        identifier: this.identifier,
        title: this.title
    }
};

schema.methods.createCollectionFromTemplate = function (templateIdentifier, cb) {
    var project = this;
    Template.findOne({_id: templateIdentifier}).exec(function (err, template) {
        template.createCollection(project, cb);
    });
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

schema.statics.identifierExists = function (identifier, cb) {
    this.find({identifier: identifier}).select('_id').exec(function (err, results) {
        cb(results.length > 0);
    });
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
                        projectsArray.push(p._id.toString());
                        projectHash[project._id.toString()] = project;
                    }
                    next();
                });
            }, function () {

                var finish = function(){
                    cb(null, projectsArray.map(function (_id) {
                        return projectHash[_id];
                    }));
                };

                if (user.showDemoProjects !== false) {

                    self.find({demo: true}).select('_id title icon identifier demo').exec(function (err, demoProjects) {

                        demoProjects.forEach(function (demoProject) {
                            var demoId = demoProject._id.toString();
                            if (projectsArray.indexOf(demoId) === -1) {
                                projectsArray.push(demoId);
                                projectHash[demoId] = demoProject;
                            }
                        });
                        finish();
                    });
                } else {
                    finish();
                }
            });
        });
    }
};

schema.methods.getUsers = function (cb) {
    var project = this;
    User.find({projects: {$elemMatch: {_id: project._id}}})
        .select("displayName _id email picture nickname avatar fullname projects")
        .exec(function (err, users) {
            users.forEach(function (u) {
                u.projectRoles = u.getRolesForProject(project);
            });
            cb(err, users);
        });
};


schema.methods.getGuests = function (cb) {
    var Guest = require('./guest');
    Guest.find({
        invitations: {
            $elemMatch: {
                _project: this._id
            }
        }
    }).exec(cb);
};

schema.methods.getUsersAndGuests = function (cb) {
    var self = this;
    var usersAndGuests = {};
    async.parallel([
        function (next) {
            self.getUsers(function (err, users) {
                usersAndGuests.users = users.map(function (u) {
                    var obj = u.toObject();
                    delete obj.projects;
                    return obj;
                });
                next();
            });
        },
        function (next) {
            self.getGuests(function (err, guests) {
                usersAndGuests.guests = guests.map(function (g) {
                    return g.toObject();
                });
                next();
            });
        }
    ], function () {
        cb(null, usersAndGuests)
    });
};

schema.set('toObject', {
    getters: true,
    virtuals: true
});

schema.virtual('roles').set(function (roles) {
    this.__roles = roles;
});

schema.virtual('roles').get(function () {
    return this.__roles;
});

module.exports = mongoose.model('Project', schema);



