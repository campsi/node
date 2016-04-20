'use strict';
var Campsi = require('campsi-core');
var extend = require('extend');
var $ = require('cheerio-or-jquery');
//todo move to campsi/collection-designer/component-list
module.exports = Campsi.extend('array', 'campsi/component-list', function ($super) {
    return {
        getDefaultOptions: function () {
            return extend({}, $super.getDefaultOptions(), {
                newItem: false,
                removeButton: true,
                cssPlaceholder: this.context.translate('panels.collection.fieldsPlaceholder'),
                items: { type: 'campsi/collection-designer/field' }
            });
        },
        attachItemEvents: function (item) {
            var instance = this;
            $super.attachItemEvents.call(this, item);
            item.bind('editProperties', function (event) {
                instance.trigger(event);
            });
        },
        optionsDidChange: function (next) {
            var instance = this;
            $super.optionsDidChange.call(instance, function () {
                instance.nodes.items.attr('data-placeholder', instance.options.cssPlaceholder);
                next();
            });
        },
        foreignDrop: function (el) {
            var $el = $(el);
            var componentType = $el.data('component-type');
            if (componentType) {
                this.createItemAt({ type: componentType }, $el.index(), function () {
                    $el.remove();
                });
            }
        }
    };
});