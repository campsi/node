var Campsi = require('campsi-core');

module.exports = Campsi.extend('form', 'campsi/billing', function (/*$super*/) {
    return {
        getDefaultOptions: function () {

            var t = this.context.translate.bind(this.context);
            return {
                fields: [{
                    label: t('panels.billing.companyName.label'),
                    name: 'companyName',
                    type: 'text'
                }, {
                    type: 'text',
                    name: 'email',
                    label: t('panels.billing.email.label')
                }, {
                    type: 'payment/credit-card',
                    name: 'creditCard',
                    label: t('panels.billing.cc.label')
                }]
            }
        }
    }
});