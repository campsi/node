var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('form', 'geo/address', function (/*$super*/) {
    return {
        getDesignerFormOptions: function () {
            return {fields: []}
        },

        getHtml: function (data, options, callback) {
            var $address = $('<address>');
            $address.append($('<p class="line">').text(data.line1));
            if (data.line2) {
                $address.append($('<p class="line">').text(data.line2));
            }
            if (data.line3) {
                $address.append($('<p class="line">').text(data.line3));
            }
            var $location = $('<p class="location">');
            $location.append($('<span class="postal-code">').text(data.postalCode));
            $location.append('&nbsp;');
            $location.append($('<span class="city">').text(data.city));
            $location.append('&nbsp;');
            if (data.region) {
                $location.append($('<span class="region">').text(data.region));
                $location.append('&nbsp;');
            }
            $location.append($('<span class="country">').text(data.country));
            $address.append($location);
            callback($address);
        },

        getTemplate: function (options, callback) {
            callback('\n<address>\n' +
                '    <p class="line">{{ this.line1 }}</p>\n' +
                '    <p class="line">{{ this.line2 }}</p>\n' +
                '    <p class="line">{{ this.line3 }}</p>\n' +
                '    <p class="location">\n' +
                '        <span class="postal-code">{{ this.postalCode }}</span>\n' +
                '        <span class="city">{{ this.city }}</span>\n' +
                '        <span class="region">{{ this.region }}</span>\n' +
                '    </p>\n' +
                '    <p class="country">{{ this.country }}</p>\n' +
                '</address>\n');
        },

        getDefaultOptions: function () {
            var t = this.context.translate.bind(this.context);
            return {
                fields: [{
                    type: 'text',
                    name: 'line1',
                    label: t('address.line1')
                    //additionalClasses: ['horizontal']
                }, {
                    type: 'text',
                    name: 'line2',
                    label: t('address.line2')
                    //additionalClasses: ['horizontal']
                }, {
                    type: 'text',
                    name: 'line3',
                    label: t('address.line3')
                    //additionalClasses: ['horizontal']
                }, {
                    type: 'text',
                    name: 'postalCode',
                    label: t('address.postalCode'),
                    size: 10,
                    additionalClasses: ['postal-code']
                }, {
                    type: 'text',
                    name: 'city',
                    label: t('address.city'),
                    size: 60,
                    additionalClasses: ['city']
                }, {
                    type: 'text',
                    name: 'region',
                    label: t('address.region'),
                    additionalClasses: ['region']
                }, {
                    type: 'text',
                    name: 'country',
                    label: t('address.country'),
                    additionalClasses: ['country']
                }]
            }
        }
    }
});