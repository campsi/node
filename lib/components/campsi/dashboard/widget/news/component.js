var Campsi = require('campsi-core');

module.exports = Campsi.extend('campsi/dashboard/widget', 'campsi/dashboard/widget/news', function(){

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
