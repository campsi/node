var isBrowser = require('is-browser');
var async = require('async');
var $ = require('cheerio-or-jquery');
var deepCopy = require('deepcopy');
var extend = require('extend');
var equals = require('equals');

var Component = function () {

};

var noop = function () {

};

var cnt = 0;

Component.prototype = Object.create({


    getDefaultValue: function () {
    },

    getDefaultOptions: function () {
        return {};
    },

    getTagName: function () {
        return 'div';
    },

    renderValue: function () {
        return '<pre data-type="' + this.type + '">' + JSON.stringify(this.serializeValue()) + '</pre>';
    },

    getDesignerFormOptions: function () {
        return {
            fields: []
        }
    },

    getAdvancedFormOptions: function () {
        return {
            fields: []
        }
    },

    initializeMemberVariables: function () {
        this.valueHistory = [];
        this.errors = [];
        this.nodes = {};

    },

    init: function (next) {

        this.initializeMemberVariables();

        var safeType = this.type.replace(/\//g, '_');

        this.id = safeType + '-' + cnt++;
        this.mountNode = $('<' + this.getTagName() + '>');
        this.mountNode
            .attr('id', this.id)
            .attr('data-type', this.type)
            .addClass(['component', safeType].join(' '));

        if (next) {
            next.call(this);
        }
    },

    wakeUp: function (el, context, callback) {

        this.context = context;
        this.initializeMemberVariables();
        this.mountNode = $(el);
        this.id = this.mountNode.attr('id');
        this.options = this.mountNode.data('options') || this.getDefaultOptions();
        this.value = this.mountNode.data('value') || this.getDefaultValue();

        var nodePaths = this.getNodePaths();

        Object.keys(nodePaths).forEach(function (name) {
            this.nodes[name] = this.mountNode.find(nodePaths[name]);
        }, this);

        callback.call(this);
    },

    getNodePaths: function () {
        return {}
    },

    attachEvents: function () {

    },


    setOptions: function (options, callback) {
        if (equals(this.options, options)) {
            return callback.call(this);
        }

        if (typeof options === 'undefined') {
            this.options = this.getDefaultOptions();
        } else {
            this.options = extend({}, this.getDefaultOptions(), options);
        }

        if (this.mountNode) {
            if (this.options.additionalClasses) {
                this.mountNode.addClass(this.options.additionalClasses.join(' '))
            }
            try {
                this.mountNode.attr('data-options', JSON.stringify(this.serializeOptions()));
            } catch (err) {
                console.error(err);
            }
        }
        this.optionsDidChange(callback);
    },

    serializeOptions: function () {
        return deepCopy(this.options);
    },

    optionsDidChange: function (callback) {
        callback.call(this, null);
    },

    resetValue: function (callback) {
        this.valueHistory.push(deepCopy(this.value));
        this.value = this.getDefaultValue();
        this.valueDidChange(callback)
    },

    processValue: function (value, callback) {
        // first param err, second processed value
        callback([], value);
    },

    isEmpty: function (value) {
        return !value || equals(value, this.getDefaultValue());
    },

    setValue: function (value, callback, propagateChangeEvent) {

        var instance = this;
        var cb = callback || noop;

        if (typeof value === 'undefined') {
            value = this.getDefaultValue();
        }

        if (typeof instance.value === 'undefined') {
            instance.value = this.getDefaultValue();
        }

        if (equals(this.value, value)) {
            async.setImmediate(cb);
            return;
        }

        instance.processValue(value, function (err, processed) {
            err = err || [];
            instance.setErrors(err, function () {
                instance.valueHistory.push(deepCopy(instance.value));
                instance.value = processed;

                if (instance.mountNode && !isBrowser) {
                    var serialized = instance.serializeValue();
                    if (typeof serialized === 'object') {
                        serialized = JSON.stringify(serialized);
                    }
                    instance.mountNode.attr('data-value', serialized);
                }

                instance.valueDidChange(function () {
                    cb();
                    if (propagateChangeEvent !== false) {
                        instance.trigger('change');
                    }
                });
            });
        });
    },

    setErrors: function (errors, callback, propagateErrorEvent) {
        this.errors = errors;
        var cb = callback || noop;
        var instance = this;
        this.errorsDidChange(function () {
            if (propagateErrorEvent !== false && errors.length > 0) {
                instance.trigger('error');
            }
            cb();
        });
    },

    errorsDidChange: function (cb) {
        cb();
    },

    getPreviousValue: function () {
        var l = this.valueHistory.length;
        if (l > 0) {
            return this.valueHistory[l - 1];
        }
    },

    valueDidChange: function (callback) {
        if (callback) {
            callback.call(this, null);
        }
    },

    setContext: function (context, callback) {
        this.context = context;
        this.contextDidChange(callback);
    },

    contextDidChange: function (callback) {
        return callback();
    },

    render: function () {
        return this.mountNode;
    },

    serializeValue: function () {
        return this.value;
    },

    getIdentifier: function () {
        return this.id;
    },

    bind: function (eventName, cb) {
        this._events = this._events || {};
        this._events[eventName] = this._events[eventName] || [];
        this._events[eventName].push(cb);
    },

    unbind: function (eventName, cb) {
        this._events = this._events || {};
        if (eventName in this._events === false) {
            return;
        }

        if (typeof cb === 'undefined') {
            this._events[eventName].length = 0
        } else {
            this._events[eventName].splice(this._events[eventName].indexOf(cb), 1);
        }
    },

    trigger: function (event) {
        var i;
        var evt;



        if(typeof event === 'string'){
            evt = {
                name: event,
                currentTarget: this
            }
        } else {
            evt = event;
        }

        if(typeof evt.target === 'undefined'){
            evt.currentTarget = this;
        }

        evt.target = this;

        this._events = this._events || {};

        if (evt.name in this._events !== false) {
            for (i = 0; i < this._events[evt.name].length; i++) {
                this._events[evt.name][i].call(this, evt)
            }
        }

        if ('*' in this._events !== false) {
            for (i = 0; i < this._events['*'].length; i++) {
                this._events['*'][i].call(this, evt)
            }
        }
    },

    forward: function (event) {
        this.trigger.call(this, event);
    }
});

module.exports = Component;
