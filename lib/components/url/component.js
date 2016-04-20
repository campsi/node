'use strict';
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('component', 'url', function ($super) {
    return {
        getDefaultValue: function () {
            return '';
        },
        getTagName: function () {
            return 'div';
        },
        getHtml: function (data, options, callback) {
            callback(data);
        },
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                Campsi.create('text', {
                    options: instance.options,
                    context: instance.context
                }, function (textComp) {
                    instance.input = textComp;
                    instance.nodes.input = textComp.render();
                    instance.nodes.goButton = $('<a target="_blank" class="btn"><i class="fa fa-external-link"></i></a>');
                    instance.mountNode.append(instance.nodes.input);
                    instance.mountNode.append(instance.nodes.goButton);
                    next();
                });
            });
        },
        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                Campsi.wakeUp(instance.nodes.input, context, function (textComp) {
                    instance.input = textComp;
                    next();
                });
            });
        },
        getNodePaths: function () {
            return {
                input: 'input',
                goButton: '.btn'
            };
        },
        attachEvents: function () {
            var instance = this;
            instance.input.attachEvents();
            instance.input.bind('*', function (event) {
                if (event.name === 'change') {
                    instance.setValue(instance.input.value);
                } else {
                    instance.forward(event);
                }
            });
        },
        valueDidChange: function (next) {
            var instance = this;
            instance.input.setValue(instance.value, function () {
                instance.nodes.goButton.attr('href', instance.value);
                next();
            });
        },
        optionsDidChange: function (next) {
            this.input.setOptions(this.options.disabled, next);
        }
    };
});