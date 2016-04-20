'use strict';
var Campsi = require('campsi-core');
var handlebars = require('handlebars');
module.exports = Campsi.extend('component', 'handlebars', function ($super) {
    return {
        getDefaultOptions: function () {
            return { template: '' };
        },
        getDefaultValue: function () {
            return {};
        },
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.templates = [];
                next();
            });
        },
        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(this, el, context, function () {
                if (instance.options.template) {
                    instance.template = handlebars.compile(instance.options.template);
                }
                next();
            });
        },
        renderTemplate: function () {
            this.mountNode.empty().html(this.template(this.value));
        },
        valueDidChange: function (next) {
            this.renderTemplate();
            next();
        },
        optionsDidChange: function (next) {
            if (typeof this.options.template === 'undefined') {
                next();
            }
            this.templates = this.templates || {};
            if (typeof this.templates[this.options.template] === 'undefined') {
                this.templates[this.options.template] = handlebars.compile(this.options.template);
            }
            this.template = this.templates[this.options.template];
            this.renderTemplate();
            next();
        }
    };
});