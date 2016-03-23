var Campsi = require('campsi-core');

module.exports = Campsi.extend('text', 'text/area', function(){
    return {
        getTagName: function(){
            return 'textarea';
        },

        submit: function(){

        }
    }
});