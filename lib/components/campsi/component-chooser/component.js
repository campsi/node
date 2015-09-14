var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

Campsi.extend('component', 'campsi/component-chooser', function ($super) {

    return {

        init: function (next) {
            var instance = this;

            $super.init.call(instance, function () {
                instance.nodes.dropzone = $('<div class="dropzone"></div>');
                instance.mountNode.append(instance.nodes.dropzone);
                next.call(instance);
            });
        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'dropzone': ' > .dropzone'
            });
        },

        getComponent: function (callback) {
            var instance = this;

            if (typeof instance.component === 'undefined') {
                Campsi.get('campsi/collection-designer/field', function (CollectionDesignerField) {
                    instance.component = new CollectionDesignerField();
                    instance.component.init(function () {
                        instance.mountNode.append(instance.component.render());
                        callback.call(instance, instance.component);
                    })
                });
            } else {
                callback.call(instance, instance.component)
            }

        },

        valueDidChange: function (next) {
            var instance = this;
            instance.getComponent(function (component) {
                component.setValue(instance.value, function () {
                    instance.nodes.dropzone.text(instance.value.type);
                    next.call();
                });
            });
        }
    }

});