var mongoose = require('mongoose');
var arrayUniq = require('array-uniq');

var schema = new mongoose.Schema({
    fullname: String,
    avatar: {
        uri: String
    },
    provider: String,
    displayName: String,
    id: String,
    name: {
        familyName: String,
        givenName: String
    },
    emails: [{value: String}],
    email: String,
    picture: String,
    nickname: String,
    projects: [{
        roles: [String],
        _id: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'}
    }],
    identities: [{
        user_id: String,
        provider: String,
        connection: String,
        isSocial: Boolean
    }]
}, {id: false});

schema.statics.findOrCreate = function (profile, cb) {
    var model = this;

    model.find({id: profile.id}).exec(function (err, results) {
        if (results.length === 0) {
            model.create(profile, cb);
        } else {
            cb(err, results[0]);
        }
    });
};

schema.methods.getEmail = function () {
    return this.email || this.emails[0].value;
};

schema.methods.addToProject = function (projectId, roles) {
    var found = false;
    this.projects.forEach(function (project) {
        if (project._id.toString() === projectId.toString()) {
            project.roles = arrayUniq(project.roles.concat(roles));
            found = true;
        }
    });

    if (found === false) {
        this.projects.push({_id: projectId, roles: roles});
    }
};

schema.methods.getRolesForProject = function (project) {

    var roles = [];
    this.projects.forEach(function (p) {
        if (project._id.toString() === p._id.toString()) {
            roles = p.roles;
        }
    });
    return roles;
};


schema.set('toObject', {
    getters: true,
    virtuals: true
});

schema.virtual('projectRoles').get(function () {
    return this._projectRoles;
});

schema.virtual('projectRoles').set(function (roles) {
    this._projectRoles = roles;
});

module.exports = mongoose.model('User', schema);


