var mongoose = require('mongoose');
var config = require('../config');
var Campsi = require('campsi');

module.exports = (function () {

    var schema = new mongoose.Schema({
        _project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
        _creator: String,
        name: String,
        identifier: String,
        date: Date,
        fields: [mongoose.Schema.Types.Mixed],
        templates: [{
            identifier: String,
            markup: String,
            scope: String
        }],
        entries: [{type: mongoose.Schema.Types.ObjectId, ref: 'Entry'}]
    });

    schema.index({_project: 1, identifier: 1}, {unique: true});

    schema.methods.identity = function () {
        return {
            _id: this._id.toString(),
            __project: this.__project,
            identifier: this.identifier,
            name: this.name
        }
    };

    schema.virtual('__project').get(function () {
        return this.___project;
    });

    schema.virtual('url').get(function () {
        if (this.___project) {
            return config.host + '/api/v1' + Campsi.url(this.___project, this);
        }
        return "/collections/" + this.identifier || this._id.toString()
    });

    schema.virtual('__project').set(function (project) {
        return this.___project = project;
    });

    schema.set('toObject', {
        getters: true,
        virtuals: true
    });

    return mongoose.model('Collection', schema);

})();


