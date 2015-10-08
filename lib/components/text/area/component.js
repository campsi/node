var Campsi = require('campsi');

module.exports = Campsi.extend('text', 'text/area', function(){
    return {
        getTagName: function(){
            return 'textarea';
        }
    }
});