var merge = require('extend');
var async = require('async');
var isBrowser = require('is-browser');
var Component = require('./component');
var Loader = require('./loader');

if (isBrowser) {
    window['module'] = {};
}

module.exports = (function () {

    /**
     *
     * @type {{Component}}
     */
    var map = {
        'component': Component
    };

    var prototypeFactories = {};

    /**
     *
     * @param parent
     * @param name
     * @param protoFactory
     * @returns {Function}
     */
    var extend = function (parent, name, protoFactory) {

        prototypeFactories[name] = {
            parent: parent,
            factory: protoFactory
        };

        triggerComponentCallbacks(name);

    };

    var componentsLoadCallbacks = {};

    var addComponentLoadCallback = function (name, cb) {
        componentsLoadCallbacks[name] = componentsLoadCallbacks[name] || [];
        componentsLoadCallbacks[name].push(cb);
    };

    var triggerComponentCallbacks = function (name) {
        var callbacks = componentsLoadCallbacks[name];
        if (callbacks === undefined) {
            return;
        }

        get(name, function (Component) {
            var i = 0, l = callbacks.length;
            for (; i < l; i++) {
                callbacks[i].call(Component, Component);
            }
            callbacks.length = 0;
        })
    };

    var get = function (name, cb) {

        if (typeof name === 'undefined') {
            throw new Error('component name must be defined');
        }
        if (typeof map[name] !== 'undefined') {
            async.setImmediate(function () {
                cb.call(map[name], map[name])
            });
        } else if (typeof prototypeFactories[name] !== 'undefined') {
            get(prototypeFactories[name].parent, function (Parent) {

                //console.info("get ", prototypeFactories[name].parent);
                var Component = function () {
                    this.type = name;
                };
                Component.prototype = merge({}, Parent.prototype, prototypeFactories[name].factory(Parent.prototype));
                map[name] = Component;

                cb.call(map[name], map[name]);
            });
        } else {

            if (typeof componentsLoadCallbacks[name] === 'undefined') {
                addComponentLoadCallback(name, cb);
                var filename = '/components/' + name + '/component.js';
                if (isBrowser) {
                    load.js(filename);
                } else {
                    require('../..' + filename);
                }
            } else {
                addComponentLoadCallback(name, cb);
            }
        }
    };

    var create = function (name, options, value, cb) {


        var c;
        var componentOptions;

        get(name, function (Component) {

            c = new Component();


            if (typeof  options === "undefined") {
                componentOptions = c.getDefaultOptions();
                componentOptions.type = name;
            } else {
                componentOptions = merge({}, c.getDefaultOptions(), options);
                if (typeof options.type === 'undefined') {
                    componentOptions.type = name;
                }
            }

            if (typeof  value === "undefined") {
                value = c.getDefaultValue();
            }

            async.series([
                function (next) {
                    c.init(next);
                },
                function (next) {
                    c.setOptions(componentOptions, next);
                },
                function (next) {
                    c.setValue(value, next);
                }
            ], function () {
                cb.call(c, c);
            });
        });
    };

    var wakeUp = function (el, cb) {
        var data = $(el).data();

        get(data.type, function (Component) {
            var componentInstance = new Component();
            componentInstance.wakeUp(el, function () { // todo maybe pass callback directly
                cb.call(null, componentInstance);
            });
        });
    };

    var getSlug = function (objOrString, returnId) {
        if (typeof objOrString === 'string') {
            return objOrString;
        }
        if (returnId) {
            return objOrString._id;
        }
        return objOrString.identifier || objOrString._id;
    };
    var url = function (project, collection, entry, isDraft) {
        var url = '/projects/' + getSlug(project);
        if (typeof collection === 'undefined') {
            return url;
        }
        url += '/collections/' + getSlug(collection);
        if (typeof entry === 'undefined') {
            return url;
        }

        if (isDraft) {
            return url + '/drafts/' + getSlug(entry);
        }

        return url + '/entries/' + getSlug(entry);
    };

    var urlApi = function (project, collection, entry, isDraft) {

        var url = '/api/v1/projects/' + getSlug(project, true);
        if (typeof collection === 'undefined') {
            return url;
        }
        url += '/collections/' + getSlug(collection, true);
        if (typeof entry === 'undefined') {
            return url;
        }

        if (isDraft) {
            return url + '/drafts/' + getSlug(entry, true);
        }

        return url + '/entries/' + getSlug(entry, true);
    };


    var getLoadedComponents = function () {
        var list = [], id;
        for (id in map) {
            list.push(id);
        }
        return list;
    };

    var load = new Loader();

    return {
        extend: extend,
        get: get,
        create: create,
        wakeUp: wakeUp,
        map: map,
        url: url,
        urlApi: urlApi,
        loader: load,
        getLoadedComponents: getLoadedComponents
    }
})();