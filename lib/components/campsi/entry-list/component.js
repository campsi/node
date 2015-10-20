var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('array', 'campsi/entry-list', function ($super) {

    return {

        getDefaultOptions: function () {
            return {
                newItemForm: false,
                items: {
                    type: 'campsi/entry-list/entry'
                }
            }
        },

        setTemplate: function (template, cb) {
            this.options.items.template = template;
            this.optionsDidChange(cb);
        }
    }

});