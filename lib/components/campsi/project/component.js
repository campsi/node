var Campsi = require('campsi');

Campsi.extend('form', 'campsi/project', function($super){

    return {

        getDefaultOptions: function(){

            return {
                fields: [{
                    name: 'title',
                    type: 'text',
                    additionalClasses: ['invisible', 'title']
                }, {
                    name: 'admins',
                    label: 'Admins',
                    type: 'campsi/user-list',
                    additionalClasses: ['admins']
                }, {
                    name: 'designers',
                    label: 'Designers',
                    type: 'campsi/user-list',
                    additionalClasses: ['designers']
                }, {
                    name: 'collections',
                    label: 'Collections',
                    type: 'campsi/collection-list',
                    additionalClasses: ['collections']
                }]
            }
        },
        attachEvents: function(){

            $super.attachEvents.call(this);

            var instance = this;

            instance.fields.collections.bind('design', function(id){
                 instance.trigger('design-collection', id);
            });
            instance.fields.collections.bind('admin', function(id){
                 instance.trigger('admin-collection', id);
            });
        }
    }

});