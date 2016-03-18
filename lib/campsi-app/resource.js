var async = require('async');

function Resource(url, children) {
    var self = this;

    this.url = url;
    this.resources = children || {};
    this.onChangeListeners = [];

    this.eachChild(function (child, name) {
        child.parentResource = self;
        child.name = name;
    });
}

Resource.prototype.serialize = function () {
    return this.data;
};

Resource.prototype.onChange = function (callback) {
    this.onChangeListeners.push(callback);
};

Resource.prototype.getData = function (params, cb) {

    var self = this;

    var nextUrl = this.getUrl(params, true);

    this.load(nextUrl, function (err, data) {
        self.setData(data, function () {
            cb(self.data);
        });
    })
};

Resource.prototype.setData = function (data, callback) {
    this.data = data;
    async.forEachSeries(this.onChangeListeners, function (listener, cb) {
        listener(data, cb);
    }, callback);
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

    console.info("resource load", this.name);
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
    delete this.data;
    this.getData({}, function () {
        async.forEach(this.resources, function (child, next) {
            child.invalidate(next)
        }, callback);
    });
};

Resource.prototype.getIdentifier = function (forceId) {
    if (typeof this.data === 'undefined') {
        return 'error';
    }
    return (forceId) ? this.data._id : this.data.identifier || this.data._id;
};

Resource.prototype.getUrl = function (params, forceId) {

    var instance = this;
    var url = this.url;

    params = params || {};

    if (this.parentResource && this.parentResource.url) {
        url = this.parentResource.getUrl(params, forceId) + url
    }

    if (this.url.indexOf(':') === -1) {
        return url;
    }

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
            data = params[param]
        } else {
            data = instance.data;
        }

        if (typeof data === 'undefined') {
            isUndefined = true;
            return;
        }

        return (forceId) ? data._id : data.identifier || data._id;
    });

    if (isUndefined) {
        return;
    }

    return url;
};

module.exports = Resource;