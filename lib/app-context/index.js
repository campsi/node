var isBrowser = require('is-browser');
var extend = require('extend');
var load = isBrowser ? require('./lib/browser') : require('./lib/server');

var Context = function () {

};

Context.prototype = Object.create(extend(load, {

    _param: function (obj) {
        if (typeof obj === 'string') {
            return obj;
        }

        if (obj._id) {
            return obj._id;
        }

        throw new Error('param must be a string or have an _id property');
    },

    _getProjectsUrl: function () {
        return '/api/v1/projects';
    },

    _getProjectUrl: function (id) {
        return this._getProjectsUrl() + '/' + this._param(id || this._project._id);
    },

    _getCollectionUrl: function (id) {
        return this._getProjectUrl() + '/collections/' + this._param(id || this._collection._id);
    },

    _getEntryUrl: function (id) {
        return this._getCollectionUrl() + '/entries/' + this._param(id || this._entry._id);
    },

    _getDraftUrl: function (id) {
        return this._getCollectionUrl() + '/drafts/' + this._param(id || this._draft._id);
    },

    projects: function (reload, cb) {
        if (typeof this._projects === 'undefined' || reload) {
            return this._load('projects', this._getProjectsUrl(), cb);
        }
        cb(this._projects);
    },

    project: function (id, reload, cb) {
        if (id || reload) {
            return this._load('project', this._getProjectUrl(id), cb);
        }
        return cb(this._project);
    },
    projectUsers: function (id, reload, cb) {
        if (id || reload) {
            return this._load('projectUsers', this._getProjectUrl(id) + '/users', cb);
        }
        return cb(this._projectUsers);
    },
    collection: function (id, reload, cb) {
        if (id || reload) {
            return this._load('collection', this._getCollectionUrl(id), cb);
        }
        return cb(this._collection);
    },
    entry: function (id, reload, cb) {
        if (id || reload) {
            return this._load('entry', this._getEntryUrl(id), cb);
        }
        cb(this._entry);
    },
    draft: function (id, reload, cb) {
        if (id || reload) {
            return this._load('draft', this._getDraftUrl(id), cb);
        }
        return cb(this._draft);
    }

}));
var ctx = new Context();
module.exports = ctx;