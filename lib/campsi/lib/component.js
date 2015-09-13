var microevent = require('microevent');
var isBrowser = require('is-browser');
var async = require('async');
var $ = require('cheerio-or-jquery');
var deepCopy = require('deepcopy');
var extend = require('extend');

var Component = function () {

};


var cnt = 0;

Component.prototype = Object.create({


    getDefaultValue: function () {
        return undefined;
    },

    getDefaultOptions: function () {
        return {};
    },

    getDesignerFormOptions: function () {
        return {
            fields: [
                /*{
                 type: 'form/text',
                 name: 'required',
                 label: 'required'
                 }*/]
        }
    },

    getDesignerFormFields: function () {
        return []
    },

    getIcon: function () {
        return '/images/coucou-icons/svg/lego2.svg'
    },

    init: function (next) {

        var safeType = this.type.replace(/\//g, '_');

        this.id = safeType + '-' + cnt++;
        this.nodes = {};
        this.mountNode = $('<div>');
        this.valueHistory = [];
        this.mountNode
            .attr('id', this.id)
            .attr('data-type', this.type)
            .addClass(['component', safeType].join(' '));

        if (next) next.call(this);
    },

    wakeUp: function (el, callback) {

        this.mountNode = $(el);
        this.nodes = {};
        this.id = this.mountNode.attr('id');
        this.options = this.mountNode.data('options') || this.getDefaultOptions();
        this.value = this.mountNode.data('value') || this.getDefaultValue();
        this.valueHistory = [];

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
        if (this.options === options) {
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
            this.mountNode.attr('data-options', JSON.stringify(this.serializeOptions()));
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

    setValue: function (value, callback) {

        if (this.value === value) {
            return callback.call(this);
        }

        if (typeof this.value !== 'undefined') {
            this.valueHistory.push(deepCopy(this.value));
        }

        if (typeof value === 'undefined') {
            value = this.getDefaultValue();
        }

        this.value = value;

        if (this.mountNode) {
            this.mountNode.attr('data-value', JSON.stringify(this.serializeValue()));
        }

        this.valueDidChange(callback);
    },

    getPreviousValue: function () {
        var l = this.valueHistory.length;
        if (l > 0) {
            return this.valueHistory[this.valueHistory.length - 1];
        }
    },

    valueDidChange: function (callback) {
        if (callback) callback.call(this, null);
    },

    render: function (callback) {
        return this.mountNode;
    },

    serializeValue: function () {
        return this.value;
    }
});

microevent.mixin(Component);

Component.prototype.trigger = function (event /* , args... */) {
    var i;

    this._events = this._events || {};

    if (event in this._events !== false) {
        for (i = 0; i < this._events[event].length; i++) {
            this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1))
        }
        return;
    }

    if ('*' in this._events !== false) {
        for (i = 0; i < this._events['*'].length; i++) {
            this._events['*'][i].apply(this, [event].concat(Array.prototype.slice.call(arguments, 1)))
        }
    }
};

module.exports = Component;
