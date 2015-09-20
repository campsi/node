var merge = require('extend');
var async = require('async');
var isBrowser = require('is-browser');
var Component = require('./component');

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

    /**
     *
     * @param parent
     * @param name
     * @param protoFactory
     * @returns {Function}
     */
    var extend = function (parent, name, protoFactory) {

        var Component;

        get(parent, function (Parent) {

            Component = function () {
                this.type = name;
            };
            Component.prototype = merge({}, Parent.prototype, protoFactory(Parent.prototype));
            map[name] = Component;
            triggerComponentCallbacks(name, Component);
        });

        return function (cb) {
            if (typeof Component == 'function') {
                triggerComponentCallbacks(name, Component);
            } else {
                addComponentLoadCallback(name, cb);
            }
        }
    };

    var componentsLoadCallbacks = {};

    var addComponentLoadCallback = function (name, cb) {
        componentsLoadCallbacks[name] = componentsLoadCallbacks[name] || [];
        componentsLoadCallbacks[name].push(cb);
    };

    var triggerComponentCallbacks = function (name, component) {
        var callbacks = componentsLoadCallbacks[name];
        if (callbacks === undefined) {
            return;
        }
        var i = 0, l = callbacks.length;
        for (; i < l; i++) {
            callbacks[i].call(component, component);
        }
        callbacks.length = 0;
    };

    var get = function (name, cb) {

        if (typeof name === 'undefined') {
            throw new Error('component name must be defined');
        }
        if (map[name] !== undefined) {
            async.setImmediate(function(){
                cb.call(map[name], map[name])
            });
        } else {
            addComponentLoadCallback(name, cb);
            var filename = '../../components/' + name + '/component.js';
            if (isBrowser) {
                Campsi.loader.js(filename);
            } else {
                require(filename);
            }
        }
    };

    var create = function (name, options, value, cb) {

        var c;

        get(name, function (Component) {
            c = new Component();

            if (typeof  options === "undefined") {
                options = c.getDefaultOptions();
            }

            if (typeof  value === "undefined") {
                value = c.getDefaultValue();
            }

            if (options.debug) {
                debugger;
            }

            options = merge({type: name}, options);

            async.series([
                function (next) {
                    c.init(next);
                },
                function (next) {
                    c.setOptions(options, next);
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

    return {

        extend: extend,
        get: get,
        create: create,
        wakeUp: wakeUp

    }
})();