'use strict';
var Resource = require('./resource');
var i18n = require('i18n');
var isBrowser = require('is-browser');
var async = require('async');
var config = require('../../browser-config');
var Context = function (serialized) {
    if (!serialized) {
        return;
    }
    this.user = serialized.user;
    this.locale = serialized.locale || 'en';
    this.config = serialized.config;
    this.panels = [];
    this.serializedResources = serialized.resources || {};
    this.resources = {};
    this.req = serialized.req;
};
Context.prototype.serialize = function () {
    return {
        user: this.user,
        locale: this.locale,
        translations: this.translations,
        config: this.config,
        resources: this.serializeResources()
    };
};
Context.prototype.serializeResources = function () {
    var resourceName;
    var self = this;
    for (resourceName in this.resources) {
        if (this.resources.hasOwnProperty(resourceName)) {
            self.serializedResources[resourceName] = self.resources[resourceName].serialize();
        }
    }
    return self.serializedResources;
};
Context.prototype.wakeUpPanels = function (callback) {
    var self = this;
    async.forEach(this.panels, function (panel, cb) {
        panel.wakeUp(self, cb);
    }, callback);
};
Context.prototype.translate = function (phrase) {
    return isBrowser ? window.I18N[phrase] : i18n.__({
        phrase: phrase,
        locale: this.locale
    });
};
Context.prototype.setRoutes = function (routes) {
    this.routes = routes;
    this.createRoutesHash();
};
Context.prototype.invalidate = function (resources, callback) {
    if (!Array.isArray(resources)) {
        resources = [resources];
    }
    var self = this;
    async.forEach(resources, function (resource, next) {
        self.getResource(resource).invalidate(next);
    }, function () {
        if (callback) {
            callback();
        }
    });
};
Context.prototype.setExpired = function (resources) {
    if (!Array.isArray(resources)) {
        resources = [resources];
    }
    var self = this;
    resources.forEach(function (resource) {
        self.getResource(resource).setExpired();
    });
};
Context.prototype.createRoutesHash = function () {
    var hash = {};
    this.routes.forEach(function (route) {
        hash[route.name] = route;
    });
    this.routesHash = hash;
};
Context.prototype.getRoute = function (routeName) {
    return this.routesHash[routeName];
};
Context.prototype.setResources = function (resources) {
    this.root = new Resource(config.host + '/', resources);
    this.root.isRoot = true;
    this.createResourcesHash();
};
Context.prototype.getResource = function (resourceName) {
    var instance = this;
    if (typeof instance.resources[resourceName] === 'undefined') {
        throw new Error('undefined resource "' + resourceName + '"');
    }
    return instance.resources[resourceName];
};
Context.prototype.get = function (resourceName, params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = false;
    }
    this.getResource(resourceName).getData(params, function (data) {
        callback(data);
    });
};
Context.prototype.set = function (resourceName, value, callback) {
    this.getResource(resourceName).setData(value, function () {
        if (callback) {
            callback();
        }
    });
};
Context.prototype.createResourcesHash = function (resource) {
    var instance = this;
    if (arguments.length === 0) {
        instance.resources = {};
        resource = instance.root;
    }
    resource.eachChild(function (childResource, childName) {
        instance.resources[childName] = childResource;
        if (typeof instance.serializedResources[childName]) {
            childResource.data = instance.serializedResources[childName];
        }
        instance.createResourcesHash(childResource);
    });
};
Context.prototype.setPanels = function (panels) {
    this.panels = panels;
};
Context.prototype.panel = function (id) {
    return this.panels[id];
};
Context.prototype.render = function (layout, callback) {
    var self = this;
    var renderedPanels = [];
    async.forEachOfSeries(self.panels, function (panel, panelId, cb) {
        if (typeof layout[panelId] === 'undefined') {
            panel.addClass('next');
        } else {
            panel.addClass(layout[panelId].join(' '));
        }
        panel.create(self, function () {
            renderedPanels.push(panel.render());
            cb();
        });
    }, function () {
        if (typeof callback === 'function') {
            callback(renderedPanels);
        } else {
            console.info(layout, callback);
            throw new Error('Context.render callback must be a function');
        }
    });
};
Context.prototype.load = function (resources, params, callback) {
    var self = this;
    async.eachSeries(resources, function (resourceName, next) {
        self.getResource(resourceName).getData(params, function () {
            next();
        });
    }, function allResourcesLoaded() {
        callback();
    });
};
Context.prototype.applicationURL = function (routeName, params, forceId) {
    var self = this;
    if (routeName.indexOf(':') > -1) {
        return routeName.replace(/(:\w+)/g, function (subRouteName) {
            return self.applicationURL(subRouteName.substring(1), params, forceId).substring(1);
        });
    }
    var route = this.getRoute(routeName);
    if (typeof route === 'undefined') {
        return console.error('Undefined route', routeName);
    }
    return route.getUrl(this, params, forceId);
};
Context.prototype.apiURL = function (resource, params, forceId) {
    return this.getResource(resource).getUrl(params, typeof forceId === 'undefined' ? true : forceId);
};
module.exports = Context;