var Campsi = require('campsi');

Campsi.extend('form/array', 'campsi/collection-list', function($super){
    return {

        getDefaultOptions:function(){
            return {
                items: {
                    type: 'campsi/collection-list/collection'
                }
            }
        },

        attachItemEvents: function(item){

            var instance = this;

            $super.attachItemEvents.call(this, item);

            item.bind('admin', function(id){
                instance.trigger('admin', id);
            });

            item.bind('design', function(id){
                instance.trigger('design', id);
            });
        }
    }
});