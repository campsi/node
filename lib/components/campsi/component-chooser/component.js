var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

Campsi.extend('component', 'campsi/component-chooser', function ($super) {

    return {

        init: function (next) {
            var instance = this;

            $super.init.call(instance, function () {
                instance.nodes.dropzone = $('<div class="dropzone dragzone placeholder"></div>');
                instance.mountNode.append(instance.nodes.dropzone);
                Campsi.create('campsi/component-chooser/component-options', undefined, undefined, function (optionsComponent) {
                    instance.optionsComponent = optionsComponent;
                    instance.nodes.dropzone.append(optionsComponent.render());
                    next.call(instance);
                });
            });
        },

        wakeUp: function (el, next) {
            var instance = this;
            $super.wakeUp.call(this, el, function () {
                Campsi.wakeUp(instance.mountNode.find('> .dropzone > .campsi_component-chooser_component-options')[0], function (optionsComponent) {
                    instance.optionsComponent = optionsComponent;
                    next();
                });
            });
        },

        attachEvents: function () {

            var instance = this;

            instance.optionsComponent.attachEvents();

            if (typeof Campsi.drake === 'undefined') {
                return;
            }

            Campsi.drake.on('drop', function (el, target, source) {

                if (target !== instance.nodes.dropzone[0]) {
                    return;
                }

                var componentType = $(el).data('component-type');
                if (componentType) {
                    instance.setValue({type: componentType}, function () {
                        instance.nodes.dropzone.find('.icon').remove();
                        instance.trigger('change');
                    });
                }
            });
        },
        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'dropzone': ' > .dropzone'
            });
        },
        valueDidChange: function (next) {
            var instance = this;
            instance.optionsComponent.setValue(instance.value, function () {
                instance.nodes.dropzone.removeClass('placeholder');
                next.call();
            });

        }
    }

});