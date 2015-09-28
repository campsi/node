var Collection = require('../models/collection');
var Entry = require('../models/entry');
var utils = require('./utils');

var getQuery = function (query) {
    return Collection.find(query || {});
};

var onExec = function (err, results) {
    if(err === null) {
        this.call(this, results.map(utils.toObject));
    } else {
        this.call(this, []);
    }
};

module.exports = {

    find: function(query, callback){
        getQuery(query).exec(onExec.bind(callback));
    },

    listEntries: function(query, callback){
        Entry.find(query).sort({index: 'asc'}).exec(onExec.bind(callback));
    },

    findEntry: function(query, callback){
        Entry.find(query || {}).exec(onExec.bind(callback));
    }
};