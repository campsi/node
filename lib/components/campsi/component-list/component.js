var Campsi = require('campsi');
var extend = require('extend');
var $ = require('cheerio-or-jquery');

Campsi.extend('form/array', 'campsi/component-list', function ($super) {

    return {

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.placeholder = $('<div class="placeholder">Placeholder</div>');
                next.call(instance);
            });
        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths.call(this), {
                placeholder: '> .control > .items > .placeholder'
            });
        },

        wakeUp: function (el, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, function () {
                if (instance.nodes.placeholder.length === 0) {
                    instance.nodes.placeholder = $('<div class="placeholder">Placeholder</div>');
                }
                next.call(instance);
            });
        },

        getDefaultOptions: function () {
            return extend({}, $super.getDefaultOptions(), {
                newItem: false,
                removeButton: true,
                items: {
                    type: 'campsi/collection-designer/field'
                }
            });
        },

        foreignDrop: function (el, source) {
            var $el = $(el);
            var componentType = $el.data('component-type');
            if (componentType) {
                this.createItemAt({type: componentType}, $(el).index(), function () {
                    $el.remove();
                });
            }
        },

        valueDidChange: function (next) {
            var instance = this;
            $super.valueDidChange.call(instance, function () {
                if (instance.value.length === 0) {
                    instance.nodes.items.append(instance.nodes.placeholder);
                } else {
                    instance.nodes.placeholder.remove();
                }
                next.call(instance);
            });
        }
    }
});