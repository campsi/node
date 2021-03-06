'use strict';
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var extend = require('extend');
module.exports = Campsi.extend('component', 'campsi/component-chooser', function ($super) {
    return {
        getDefaultValue: function () {
            return {};
        },
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.dropzone = $('<div class="dropzone dragzone placeholder"></div>');
                instance.nodes.type = $('<div class="component-type component icon draggable"><div class="icon"><img></div><span class="name"></span></div>');
                instance.nodes.dropzone.append(instance.nodes.type);
                instance.mountNode.append(instance.nodes.dropzone);
                Campsi.create('form', { context: instance.context }, function (optionsComponent) {
                    instance.optionsComponent = optionsComponent;
                    instance.mountNode.append(optionsComponent.render());
                    next.call(instance);
                });
            });
        },
        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(this, el, context, function () {
                Campsi.wakeUp(instance.mountNode.find('.component.form')[0], context, function (optionsComponent) {
                    instance.optionsComponent = optionsComponent;
                    next();
                });
            });
        },
        attachEvents: function () {
            var instance = this;
            instance.optionsComponent.attachEvents();
            instance.optionsComponent.bind('*', function (event) {
                if (event.name === 'change') {
                    return instance.setValue(extend({}, instance.value, this.value));
                }
                return instance.forward(event);
            });
            if (typeof Campsi.drake === 'undefined') {
                return;
            }
            Campsi.drake.on('over', function (el, container) {
                if (container !== instance.nodes.dropzone[0]) {
                    return;
                }
                instance.nodes.type.hide();
            });
            Campsi.drake.on('out', function (el, container) {
                if (container !== instance.nodes.dropzone[0]) {
                    return;
                }
                instance.nodes.type.show();
            });
            Campsi.drake.on('drop', function (el, target) {
                if (target !== instance.nodes.dropzone[0]) {
                    return;
                }
                var componentType = $(el).data('component-type');
                if (componentType) {
                    instance.setValue({ type: componentType }, function () {
                        $(el).remove();
                        instance.nodes.type.show();
                        instance.trigger('change');
                    });
                }
            });
        },
        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'dropzone': ' > .dropzone',
                type: '> .dropzone > .component-type'
            });
        },
        valueDidChange: function (next) {
            var instance = this;
            if (typeof instance.value.type === 'undefined') {
                return next();
            }
            Campsi.get(instance.value.type, function (Component) {
                var componentOptions = Component.prototype.getDesignerFormOptions.call();
                instance.optionsComponent.setOptions(componentOptions, function () {
                    instance.optionsComponent.setValue(instance.value, function () {
                        instance.optionsComponent.setContext(instance.context, function () {
                            instance.nodes.type.find('img').attr('src', '/components/' + instance.value.type + '/icon.png');
                            instance.nodes.type.find('span').text(instance.value.type);
                            next();
                        });
                    });
                });
            });
        }
    };
});