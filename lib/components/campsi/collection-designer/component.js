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

        save: function () {
            var instance = this;

            var url = this.context.apiURL('collection');
            var method = 'PUT';

            $.ajax({
                url: url,
                method: method,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify({fields: instance.value.fields})
            }).done(function () {
                instance.trigger('saved');
                instance.context.invalidate('collection');
            }).error(function () {
                instance.trigger('save-error');
            });
        },


        serializeOptions: function () {
        },

        serializeValue: function () {
        }

    }
});