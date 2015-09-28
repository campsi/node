var Component = require('../models/component');
var utils = require('./utils');

var getQuery = function (query) {
    return Component.find(query || {});
};

module.exports = {

    find: function(query, callback){
        getQuery(query).exec(function (err, results) {
            callback(results.map(utils.toObject));
        });
    }
};