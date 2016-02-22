var Campsi = require('campsi');

module.exports = Campsi.extend('campsi/dashboard/widget', 'campsi/dashboard/widget/news', function($super){

    return {
        getDefaultOptions: function(){
            return {
                header: {
                    text: 'News'
                }
            }
        }
    }
});
