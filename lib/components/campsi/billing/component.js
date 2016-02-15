var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('form', 'campsi/billing', function ($super) {
    return {
        getDefaultOptions: function () {

            var t = this.context.translate.bind(this.context);
            return {
                fields: [{
                    label: t('panels.billing.companyName.label'),
                    name: 'companyName',
                    type: 'text'
                },
                    {
                        type: 'text',
                        name: 'phone',
                        label: t('panels.billing.phone.label')
                    }, {
                        type: 'text',
                        name: 'vatNumber',
                        label: t('panels.billing.vatNumber.label')
                    }, {
                        type: 'geo/address',
                        name: 'address',
                        label: t('panels.billing.address.label')
                    }
                ]
            }
        }
    }
});