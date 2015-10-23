module.exports = (function(){
    var mongoose = require('mongoose');
    var async = require('async');
    var Project = require('./project');

    var schema = new mongoose.Schema({
        email: {type: String, required: true},
        invitations: [{
            _inviter: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
            _project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true},
            roles: [String]
        }]
    });

    schema.index({email: 1}, {unique: true});

    schema.methods.turnIntoUser = function(user, callback){
        async.forEach(this.invitations, function (invitation, cb) {
            Project.findOne({_id: invitation._project}, function (err, project) {
                if(project === null){
                    return cb();
                }
                user.addToProject(invitation._project, invitation.roles);
                cb();
            });
        }, function () {
            user.save(function(){
                callback.call();
            });
        });
    };

    return mongoose.model('Guest', schema);
})();

