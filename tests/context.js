var Ctx = function () {
    this.resources = {
        projects: {
            url: '/api/v1/projects'
        },
        components: {
            url: '/api/v1/components'
        },
        project: {
            url: '/api/v1/projects/:id'
        },
        collection: {
            url: ':project/collections/:id'
        },
        entriesAndDrafts: {
            url: ':collection/entries-and-drafts'
        },
        entry: {
            url: ':collection/entries/:id'
        },
        draft: {
            url: ':collection/drafts/:id'
        },
        projectUsers: {
            url: ':project/users'
        },
        projectDeployments: {
            url: ':project/deployments'
        }
    };
};

Ctx.prototype = {

    get: function (resource, id, cb) {
        var ctx = this;
        var rsrc = ctx.resources[resource];

        if (typeof id === 'function') {
            if (typeof rsrc.data === 'undefined') {
                ctx.load(ctx.url(resource), function (data) {
                    rsrc.data = data;
                    id(rsrc.data);
                });
            } else {
                id(rsrc.data);
            }
        } else {
            if (rsrc.id !== id || rsrc.slug !== id || typeof rsrc.data === 'undefined') {
                var href = ctx.url(resource, id);
                ctx.load(href, function (data) {
                    rsrc.data = data;
                    rsrc.id = data._id;
                    rsrc.slug = data.identifier;
                    cb(rsrc.data);
                });
            } else {
                cb(rsrc.data);
            }
        }
    },

    set: function (resource, data) {
        var rsrc = this.resources[resource];
        rsrc.data = data;
        rsrc.slug = data.identifier;
        rsrc.id = data._id;
    },

    load: function (url, cb) {
        cb({'_id': '9932093023', 'url': url});
    },

    invalidate: function (resource) {
        delete this.resources[resource].data;
        delete this.resources[resource].slug; // todo slug change as parameter?
    },

    pretty: function (url) {
        var ctx = this;
        url = url.replace(/:\w+/g, function (param) {
            var resource = ctx.resources[param.substring(1)];
            if (typeof resource === 'undefined') {
                throw new Error('Unknown resource', param);
            }
            return resource.slug || resource.id;
        });
        return url;
    },

    url: function (resource, id) {
        var url = this.resources[resource].url;
        var resourceId = id || this.resources[resource].id;

        var ctx = this;
        url = url.replace(/:\w+/g, function (param) {
            if (param === ':id') {
                if (typeof resourceId === 'undefined') {
                    throw new Error('undefined id for resource', resource);
                }
                return resourceId;
            } else {
                return ctx.url(param.substring(1));
            }
        });
        return url;
    }
};

module.exports = Ctx;