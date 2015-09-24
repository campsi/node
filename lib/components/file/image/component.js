var Campsi = require('campsi');

module.exports = Campsi.extend('file', 'file/image', function($super){
   return {
       valueDidChange: function(next){
           var instance = this;

           if (typeof instance.value !== 'undefined') {
               instance.nodes.file.css('background-image', 'url(' + instance.value.uri +')');
           }
           next();
       }
   }
});