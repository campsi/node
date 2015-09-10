var Campsi = require('campsi');
var extend = require('extend');
var $ = require('cheerio-or-jquery');

Campsi.extend('form/array', 'campsi/collection-designer', function ($super) {

    return {
        getDefaultOptions: function () {
            return extend({}, $super.getDefaultOptions(), {
                label: 'Fields',
                newItem: false,
                removeButton: false,
                items: {
                    type: 'campsi/collection-designer/field'
                }
            });
        },

        foreignDrop: function(el, source){
            var $el = $(el);
            var componentType = $el.data('component-type');
            if(componentType){
                this.createItemAt({type: componentType}, $(el).index(), function(){
                    $el.remove();
                });
            }
        }
    }
});