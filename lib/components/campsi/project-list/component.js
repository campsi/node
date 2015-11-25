var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('array', 'campsi/project-list', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                newItem: true,
                items: {
                    type: 'campsi/project-list/project'
                }
            }
        },

        serializeOptions: function () {
        },
        serializeValue: function () {
        }
    }
});