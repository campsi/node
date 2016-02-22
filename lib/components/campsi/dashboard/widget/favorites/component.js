var Campsi = require('campsi');

Campsi.extend('campsi/dashboard/widget', 'campsi/dashboard/widget/favorites', function($super){
    return {
        getDefaultOptions: function(){
            return {
                header: {
                    text: 'My favorites'
                }
            }
        }
    }
});