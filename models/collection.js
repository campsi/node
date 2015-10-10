var mongoose = require('mongoose');

var schema =  new mongoose.Schema({
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

schema.methods.identity = function(){
    return {
        _id: this._id.toString(),
        __project: this.__project,
        identifier: this.identifier,
        name: this.name
    }
};

//http://stackoverflow.com/questions/13327011/mongoose-key-val-set-on-instance-not-show-in-json-or-console-why/13328312#13328312

schema.virtual('__project').get(function() {
    return this.___project;
});

schema.virtual('__project').set(function(project) {
    return this.___project = project;
});

schema.set('toObject', {
    getters: true,
    virtuals: true
});

module.exports = mongoose.model('Collection', schema);

