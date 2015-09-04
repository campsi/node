var Campsi = require('campsi');

Campsi.extend('form', 'campsi/project', function($super){

    return {

        getDefaultOptions: function(){

            return {
                fields: [{
                    name: 'title',
                    type: 'form/text',
                    label: 'Title',
                    additionalClasses: ['invisible']
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
                    type: 'campsi/collection-list'
                }]
            }
        },
        init: function(next){

            var instance = this;

            $super.init.call(instance, function(){

                next.call();
            });
        }
    }

});