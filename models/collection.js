var mongoose = require('mongoose');

var schema =  new mongoose.Schema({
    _project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
    _creator: String,
    name: String,
    date: Date,
    props: {
        fields: [mongoose.Schema.Types.Mixed] // todo remplacer par le schema Field
    }
});

module.exports = mongoose.model('Collection', schema);

