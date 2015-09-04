var Campsi = require('campsi');

Campsi.extend('form/array', 'campsi/collection-list', function($super){
    return {

        getDefaultOptions:function(){
            return {
                items: {
                    type: 'campsi/collection-list/collection'
                }
            }
        }
    }
});