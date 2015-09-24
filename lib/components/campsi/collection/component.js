var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('form', 'campsi/collection', function () {

    return {
        getDefaultOptions: function () {
            return {
                fields: [{
                    label: 'name',
                    name: 'name',
                    type: 'text'
                }]
            }
        }
    }
});