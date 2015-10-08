var Campsi = require('campsi');
var extend = require('extend');
var $ = require('cheerio-or-jquery');
//todo move to campsi/collection-designer/component-list
module.exports = Campsi.extend('array', 'campsi/component-list', function ($super) {

    return {

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
        }
    }
});