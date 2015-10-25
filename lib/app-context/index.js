var isBrowser = require('is-browser');
var extend = require('extend');
var load = isBrowser ? require('./lib/browser') : require('./lib/server');

var Context = function (source) {
    extend(this, source);
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

    _getComponentsUrl: function () {
        return '/api/v1/components';
    },

    _getProjectUrl: function (id) {
        return this._getProjectsUrl() + '/' + this._param(id || this._project._id);
    },

    _getCollectionUrl: function (id) {
        return this._getProjectUrl() + '/collections/' + this._param(id || this._collection._id);
    },

    _getEntriesAndDraftsUrl: function () {
        return this._getCollectionUrl() + '/entries-and-drafts';
    },

    _getEntryUrl: function (id) {
        return this._getCollectionUrl() + '/entries/' + this._param(id || this._entry._id);
    },

    _getDraftUrl: function (id) {
        return this._getCollectionUrl() + '/drafts/' + this._param(id || this._draft._id);
    },

    components: function (reload, cb) {
        if (typeof this._components === 'undefined' || reload) {
            return this._load(reload, 'components', this._getComponentsUrl(), cb);
        }
        cb(this._components);
    },

    projects: function (reload, cb) {
        if (typeof this._projects === 'undefined' || reload) {
            return this._load(reload, 'projects', this._getProjectsUrl(), cb);
        }
        cb(this._projects);
    },

    project: function (id, reload, cb) {
        if (id || reload) {
            return this._load(reload, 'project', this._getProjectUrl(id), cb);
        }
        return cb(this._project);
    },
    projectUsers: function (id, reload, cb) {
        if (id || reload) {
            return this._load(reload, 'projectUsers', this._getProjectUrl(id) + '/users', cb);
        }
        return cb(this._projectUsers);
    },
    collection: function (id, reload, cb) {
        console.info(id);
        if (id || reload) {
            return this._load(reload, 'collection', this._getCollectionUrl(id), cb);
        }
        return cb(this._collection);
    },
    entriesAndDrafts: function (reload, cb) {
        if (reload) {
            return this._load(reload, 'entriesAndDrafts', this._getEntriesAndDraftsUrl(), cb);
        }
        return cb(this._entriesAndDrafts);
    },
    entry: function (id, reload, cb) {
        if (id || reload) {
            return this._load(reload, 'entry', this._getEntryUrl(id), cb);
        }
        cb(this._entry);
    },
    draft: function (id, reload, cb) {
        if (id || reload) {
            return this._load(reload, 'draft', this._getDraftUrl(id), cb);
        }
        return cb(this._draft);
    }
}));

var instance = new Context(isBrowser ? window.CAMPSI_CONTEXT : {});

module.exports = function (createNewInstance) {
    if (createNewInstance) {
        return new Context();
    } else {
        return instance;
    }
};