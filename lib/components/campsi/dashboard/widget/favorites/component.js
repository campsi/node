var Campsi = require('campsi');

Campsi.extend('campsi/dashboard/widget', 'campsi/dashboard/widget/favorites', function(){
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