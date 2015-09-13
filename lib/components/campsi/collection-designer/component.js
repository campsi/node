var Campsi = require('campsi');
var extend = require('extend');
var $ = require('cheerio-or-jquery');

Campsi.extend('form', 'campsi/collection-designer', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                fields: [{
                    name: 'fields',
                    type: 'campsi/component-list'
                }]
            };
        }
    }
});