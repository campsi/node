var mongoose = require('mongoose');

var schema =  new mongoose.Schema({
    _project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
    _creator: String,
    name: String,
    date: Date,
    fields: [mongoose.Schema.Types.Mixed],
    templates: [{
        identifier: String,
        markup: String,
        scope: String
    }]
});

module.exports = mongoose.model('Collection', schema);

