var mongoose = require('mongoose');
var arrayUniq = require('array-uniq');

var schema = new mongoose.Schema({
    locale: String,
    fullname: String,
    newsletterSubscribe: Boolean,
    showDemoProjects: {type: Boolean, default: true},
    avatar: {
        uri: String,
        src: String,
        size: Number,
        mime: String,
        height: Number,
        width: Number
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
            if (profile.provider === 'facebook') {
                profile.fullname = profile.nickname;
            }
            model.create(profile, cb);
        } else {
            cb(err, results[0]);
        }
    });
};

schema.methods.getEmail = function () {
    if(this.email){
        return this.email;
    }

    if(this.emails.length > 0){
        return this.emails[0].value;
    }
};

schema.methods.getProjectIndex = function (projectId) {
    var projectIndex = -1;
    this.projects.forEach(function (project, index) {
        if (project._id.toString() === projectId.toString()) {
            projectIndex = index;
        }
    });
    return projectIndex;
};

schema.methods.addToProject = function (projectId, roles) {
    var projectIndex = this.getProjectIndex(projectId);
    if (projectIndex > -1) {
        this.projects[projectIndex].roles = arrayUniq(this.projects[projectIndex].roles.concat(roles));
    } else {
        this.projects.push({_id: projectId, roles: roles});
    }
};

schema.methods.removeFromProject = function (projectId) {
    var projectIndex = this.getProjectIndex(projectId);
    if (projectIndex > -1) {
        this.projects.splice(projectIndex, 1);
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


