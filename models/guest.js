'use strict';
var mongoose = require('mongoose');
var async = require('async');
var Project = require('./project');
var schema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    invitations: [{
        _inviter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        _project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        roles: [String],
        message: String
    }]
}, {id: false});
schema.index({email: 1}, {unique: true});
schema.methods.getInvitationIndex = function (projectId) {
    var index = -1;
    this.invitations.forEach(function (invitation, i) {
        if (invitation._project.toString() === projectId.toString()) {
            index = i;
        }
    });
    return index;
};
schema.methods.cancelInvitation = function (projectId) {
    var index = this.getInvitationIndex(projectId);
    if (index > -1) {
        this.invitations.splice(index, 1);
    }
};
schema.methods.turnIntoUser = function (user, callback) {
    var self = this;
    async.forEach(this.invitations, function (invitation, cb) {
        Project.findOne({_id: invitation._project}, function (err, project) {
            if (project === null) {
                return cb();
            }
            user.addToProject(invitation._project, invitation.roles);
            cb();
        });
    }, function () {
        user.save(function () {
            self.constructor.delete({_id: self._id}, callback);
        });
    });
};
module.exports = mongoose.model('Guest', schema);