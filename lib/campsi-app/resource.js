'use strict';
var async = require('async');
function Resource(url, children) {
    var self = this;
    this.url = url;
    this.resources = children || {};
    this.onChangeListeners = [];
    this.hasIdentifier = this.url.indexOf(':') > -1;
    this.lastModified = new Date();
    this.eachChild(function (child, name) {
        child.parentResource = self;
        child.name = name;
    });
}
Resource.TTL = 60000;
Resource.prototype.serialize = function () {
    return this.data;
};
Resource.prototype.onChange = function (callback) {
    this.onChangeListeners.push(callback);
};
Resource.prototype.hasData = function () {
    return typeof this.data !== 'undefined';
};
Resource.prototype.hasExpired = function () {
    return typeof this.lastModified === 'undefined' || Date.now() - this.lastModified > Resource.TTL;
};
Resource.prototype.setExpired = function () {
    delete this.lastModified;
};
Resource.prototype.isSameResource = function (params) {
    if (this.parentResource && this.parentResource.url && !this.parentResource.isSameResource()) {
        return false;
    }
    if (typeof params === 'undefined') {
        return true;
    }
    var thisParam = params[this.name];
    var typeofThisParam = typeof thisParam;
    if (typeofThisParam === 'undefined') {
        return true;
    }
    if (typeofThisParam === 'string') {
        return this.data._id === thisParam || this.data.identifier === thisParam;
    }
    if (typeofThisParam === 'object') {
        return this.data._id === thisParam._id;
    }
    return false;
};
Resource.prototype.getData = function (params, cb) {
    var self = this;
    if (self.hasData() && !self.hasExpired() && (!this.hasIdentifier || this.isSameResource(params))) {
        return async.forEachSeries(self.onChangeListeners, function (listener, cb) {
            listener(self.data, cb);
        }, function () {
            cb(self.data);
        });
    }
    var nextUrl = this.getUrl(params, true);
    this.load(nextUrl, function (err, data) {
        self.setData(data, function () {
            cb(self.data);
        }, true);
    });
};
Resource.prototype.setData = function (data, callback, invalidateChildren) {
    this.data = data;
    this.lastModified = new Date();
    var self = this;
    var callListeners = function () {
        async.forEachSeries(self.onChangeListeners, function (listener, cb) {
            listener(data, cb);
        }, callback);
    };
    if (invalidateChildren) {
        this.invalidateChildren(callListeners);
    } else {
        callListeners();
    }
};
/**
 * Only used in server side. It's overwritten by browser.js
 *
 * @param url
 * @param callback
 * @returns {*}
 */
Resource.prototype.load = function (url, callback) {
    if (typeof this.data === 'undefined') {
        return callback('Error, resource is not loaded' + this.name);
    }
    callback(null, this.data);
};
Resource.prototype.eachChild = function (callback) {
    var childResourceName;
    for (childResourceName in this.resources) {
        if (this.resources.hasOwnProperty(childResourceName)) {
            callback(this.resources[childResourceName], childResourceName);
        }
    }
};
Resource.prototype.invalidate = function (callback) {
    this.setData(undefined, callback, true);
};
Resource.prototype.invalidateChildren = function (callback) {
    async.forEach(this.resources, function (child, next) {
        child.invalidate(next);
    }, callback);
};
Resource.prototype.getIdentifier = function (forceId) {
    if (typeof this.data === 'undefined') {
        return 'error';
    }
    return forceId ? this.data._id : this.data.identifier || this.data._id;
};
Resource.prototype.getUrl = function (params, forceId) {
    if (this.isRoot === true) {
        return this.url;
    }
    var instance = this;
    var url = this.url;
    params = params || {};
    var isUndefined = false;
    url = url.replace(/:\w+/, function (param) {
        param = param.substring(1);
        var data = instance;
        if (params[param]) {
            if (typeof params[param] === 'string') {
                if (params[param] === 'new') {
                    isUndefined = true;
                }
                return params[param];
            }
            data = params[param];
        } else {
            data = instance.data;
        }
        if (typeof data === 'undefined') {
            isUndefined = true;
            return;
        }
        return forceId ? data._id : data.identifier || data._id;
    });
    if (isUndefined) {
        return;
    }
    if (this.parentResource && this.parentResource.url) {
        url = this.parentResource.getUrl(params, forceId) + url;
    }
    return url;
};
module.exports = Resource;