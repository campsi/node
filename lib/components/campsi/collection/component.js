var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('form', 'campsi/collection', function () {

    return {
        getDefaultOptions: function () {
            return {
                fields: [{
                    name: 'name',
                    type: 'text',
                    additionalClasses: ['invisible', 'big-title']
                }, {
                    label: 'title accessor',
                    name: 'titleAcessor',
                    type: 'text'
                }, {
                    label: 'summary accessor',
                    name: 'summaryAcessor',
                    type: 'text'
                },{
                    label: 'templates',
                    name: 'templates',
                    type: 'array',
                    items: {
                        type: 'form',
                        fields: [{
                            name: 'identifier',
                            label: 'identifier',
                            type: 'text'
                        }, {
                            name: 'markup',
                            label: 'markup',
                            type: 'text'
                        }]
                    }
                }]
            }
        },

        load: function (id, next) {
            var instance = this;
            var url = '/api/v1/collections/' + id;
            $.getJSON(url, function (data) {
                instance.setValue(data, function () {
                    instance.trigger('reset');
                    next();
                });
            });
        },

        save: function () {
            this.trigger('saved');
        }
    }
});