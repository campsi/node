var Campsi = require('campsi');

module.exports = Campsi.extend('form', 'geo/address', function (/*$super*/) {
    return {
        getDefaultOptions: function () {
            var t = this.context.translate.bind(this.context);
            return {
                fields: [{
                    type: 'text',
                    name: 'line1',
                    label: t('address.line1')
                }, {
                    type: 'text',
                    name: 'line2',
                    label: t('address.line2')
                }, {
                    type: 'text',
                    name: 'line3',
                    label: t('address.line3')
                }, {
                    type: 'text',
                    name: 'postalCode',
                    label: t('address.postalCode')
                }, {
                    type: 'text',
                    name: 'region',
                    label: t('address.region')
                }, {
                    type: 'text',
                    name: 'city',
                    label: t('address.city')
                }, {
                    type: 'text',
                    name: 'country',
                    label: t('address.country')
                }]
            }
        }
    }
});