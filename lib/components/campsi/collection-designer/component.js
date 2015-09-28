var Campsi = require('campsi');
var extend = require('extend');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('form', 'campsi/collection-designer', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                fields: [{
                    name: 'fields',
                    type: 'campsi/component-list'
                }]
            };
        },

        getUrl: function(){
            return '/api/v1/collections/' + this.value.id;
        },

        reload: function (next) {
            var instance = this;
            $.getJSON(instance.getUrl(), function (data) {
                instance.setValue(data, function(){
                    instance.trigger('reset');
                    next();
                });
            });
        },
        load: function(id, cb){
            this.value.id = id;
            this.reload(cb);
        }
    }
});