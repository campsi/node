var Campsi = require('campsi-core');

module.exports = Campsi.extend('form', 'geo/address', function (/*$super*/) {
    return {
        getDefaultOptions: function () {
            var t = this.context.translate.bind(this.context);
            return {
                fields: [{
                    type: 'text',
                    name: 'line1',
                    label: t('address.line1'),
                    //additionalClasses: ['horizontal']
                }, {
                    type: 'text',
                    name: 'line2',
                    label: t('address.line2'),
                    //additionalClasses: ['horizontal']
                }, {
                    type: 'text',
                    name: 'line3',
                    label: t('address.line3'),
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