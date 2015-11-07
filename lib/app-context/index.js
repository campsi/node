var $ = require('cheerio-or-jquery');
var extend = require('extend');
var Ctx = function (serialized) {
    this.resources = {
        root: {
            url: {
                api: '/api/v1',
                app: '/'
            }
        },
        projects: {
            url: {
                api: ':root/projects',
                app: '/projects'
            }
        },
        components: {
            url: {
                api: ':root/components'
            }
        },
        project: {
            url: {
                api: ':projects/:project',
                app: ':projects/:project'
            }
        },
        collection: {
            url: {
                api: ':project/collections/:collection',
                app: ':project/collections/:collection'
            }
        },
        entriesAndDrafts: {
            url: {
                api: ':collection/entries-and-drafts'
            }
        },
        collectionAdmin: {
            url: {
                app: ':collection/admin'
            }
        },
        collectionDesign: {
            url: {
                app: ':collection/design'
            }
        },
        entry: {
            url: {
                api: ':collection/entries/:entry',
                app: ':collection/entries/:entry'
            }
        },
        draft: {
            url: {
                api: ':collection/drafts/:draft',
                app: ':collection/drafts/:draft'
            }
        },
        projectUsers: {
            url: {
                api: ':project/users',
                app: ':project/users'
            }
        },
        projectDeployments: {
            url: {
                api: ':project/deployments',
                app: ':project/deployments'
            }
        }
    };

    extend(this, serialized);
};

Ctx.prototype = {

    get: function (resource, params, cb) {
        var ctx = this;
        var rsrc = ctx.resources[resource];

        if (typeof cb === 'undefined') {
            return params(rsrc.data);
        }

        var href = ctx.apiURL(resource, params);
        ctx.load(href, function (data) {
            rsrc.data = data;
            rsrc._id = data._id;
            rsrc.identifier = data.identifier;
            cb(rsrc.data);
        });
    },

    set: function (resource, data) {
        var rsrc = this.resources[resource];
        rsrc.data = data;
        rsrc.identifier = data.identifier;
        rsrc._id = data._id;
    },

    load: function (url, cb) {
        $.getJSON(url, cb)
    },

    invalidate: function (resource) {
        delete this.resources[resource].data;
        delete this.resources[resource].identifier;
    },

    applicationURL: function (resource, params) {
        return this.url('app', resource, params);
    },

    apiURL: function (resource, params) {
        return this.url('api', resource, params);
    },

    url: function (domain, resource, params) {
        params = params || {};

        var forceId = (domain === 'api');
        if (typeof this.resources[resource] === 'undefined') {
            throw new Error('undefined resource "' + resource + '"');
        }

        var url = this.resources[resource].url[domain];
        var ctx = this;
        url = url.replace(/:\w+/g, function (param) {
            if (param === ':' + resource) {
                if (params[resource]) {
                    if (typeof params[resource] === 'string')
                        return params[resource];

                    if (!forceId && typeof params[resource].identifier !== 'undefined')
                        return params[resource].identifier;

                    return params[resource]._id;
                }

                if (typeof ctx.resources[resource] !== 'undefined') {
                    if (!forceId && typeof ctx.resources[resource].identifier !== 'undefined')
                        return ctx.resources[resource].identifier;

                    return ctx.resources[resource]._id
                }
                throw new Error('undefined resource "' + resource + '"');
            } else {
                return ctx.url(domain, param.substring(1), params);
            }
        });
        return url;
    }
};

module.exports = Ctx;