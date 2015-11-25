var $ = require('cheerio-or-jquery');
var extend = require('extend');
var i18n = require('i18n');
var isBrowser = require('is-browser');

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
        templates: {
            url: {
                api: ':root/templates'
            }
        },
        project: {
            url: {
                api: ':projects/:project',
                app: ':projects/:project'
            },
            invalidate: ['entriesAndDrafts', 'entry', 'draft', 'projectUsers', 'projectDeployments']
        },
        collection: {
            url: {
                api: ':project/collections/:collection',
                app: ':project/collections/:collection'
            },
            invalidate: ['entriesAndDrafts', 'entry', 'draft']
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

    setLocale: function (locale) {
        this.locale = locale;
    },

    translate: function (phrase) {
        return (isBrowser) ? phrase : i18n.__({phrase: phrase, locale: this.locale});
    },

    get: function (resource, params, cb) {

        var ctx = this;

        var resourceInContext = ctx.resources[resource];
        var resourceInContextHasID = typeof resourceInContext._id !== 'undefined';
        var resourceInContextHasData = typeof resourceInContext.data !== 'undefined';
        var paramsWerePassed = (typeof cb !== 'undefined' && typeof params !== 'function');
        var href;

        //console.info({
        //    resource: resource,
        //    resourceInContextHasData: resourceInContextHasData,
        //    resourceInContextHasID: resourceInContextHasID,
        //    paramsWerePassed: paramsWerePassed,
        //    resourceInContext: JSON.parse(JSON.stringify(resourceInContext)),
        //    resourceInContextParam: resourceInContextParams,
        //    paramsInContextEqualsParams: (equals(resourceInContextParams, params) || typeof resourceInContextParams === 'undefined'),
        //    params: params
        //});

        if (resourceInContextHasData
            && (!resourceInContextHasID // the resource may not have ID ('projects', 'components', etc.)
                || !paramsWerePassed // no params were passed, request for the current one
                || !resource in params // params were passed, but none for the specified resource
            )
        ) {
            return paramsWerePassed ? cb(resourceInContext.data) : params(resourceInContext.data);
        }

        if (paramsWerePassed) {
            var typeofParamForResource = typeof params[resource];
            if (typeofParamForResource === 'string' // an identifier or _id is passed directly
                && (params[resource] === resourceInContext._id || params[resource] === resourceInContext.identifier)
                && typeof resourceInContext.data !== 'undefined') {
                return cb(resourceInContext.data);
            } else if (typeofParamForResource === 'object'
                && params[resource]._id === resourceInContext._id
                && typeof resourceInContext.data !== 'undefined') {
                return cb(resourceInContext.data);
            }
            href = ctx.apiURL(resource, params);
        } else {
            href = ctx.apiURL(resource);
        }

        ctx.load(href, function (data) {
            ctx.invalidate(resource, true);

            resourceInContext.data = data;
            resourceInContext._id = data._id;
            resourceInContext.identifier = data.identifier;

            if (paramsWerePassed) {
                return cb(resourceInContext.data)
            } else {
                return params(resourceInContext.data);
            }
        });
    },

    set: function (resource, data) {
        var rsrc = this.resources[resource];
        rsrc.data = data;
        rsrc.identifier = data.identifier;
        rsrc._id = data._id;
    },

    load: $.getJSON,

    invalidate: function (resource, identifierChanged) {
        var instance = this;

        delete instance.resources[resource].data;
        if (identifierChanged) {
            delete instance.resources[resource].identifier;
        }

        if (Array.isArray(instance.resources[resource].invalidate)) {
            instance.resources[resource].invalidate.forEach(function (resourceToInvalidate) {
                instance.invalidate(resourceToInvalidate, true);
            });
        }
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