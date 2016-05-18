'use strict';

var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var deepCopy = require('deepcopy');

module.exports = Campsi.extend('component', 'campsi/billing', function ($super) {

    return {
        getFormOptions: function () {
            var t = this.context.translate.bind(this.context);
            return {
                fields: [
                    {
                        label: t('panels.billing.companyName.label'),
                        name: 'companyName',
                        type: 'text'
                    },
                    {
                        type: 'text',
                        name: 'contact',
                        label: t('panels.billing.contact')
                    },
                    {
                        type: 'text',
                        name: 'vat',
                        label: t('panels.billing.vat')
                    },
                    {
                        type: 'text',
                        name: 'email',
                        label: t('panels.billing.email.label')
                    },
                    {
                        type: 'payment/credit-card',
                        name: 'creditCard',
                        label: t('panels.billing.cc.label')
                    }
                ]
            };
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                Campsi.create('form', {context: instance.context, options: instance.getFormOptions()}, function (form) {
                    instance.mountNode.append(form.render());
                    instance.form = form;
                    next();
                });

            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                Campsi.wakeUp(instance.nodes.form, context, function (form) {
                    instance.form = form;
                    next();
                });
            })
        },

        attachEvents: function () {
            var instance = this;
            Stripe.setPublishableKey(instance.context.config.stripe.publishableKey);
            instance.form.attachEvents();
            instance.form.bind('change', function () {
                instance.setValue(instance.form.value);
            });
        },

        getNodePaths: function () {
            return {
                form: '> .form'
            };
        },

        valueDidChange: function (next) {
            console.info(this.value);
            this.form.setValue(this.value, next);
        },

        save: function () {
            var instance = this;
            var cc = this.value.creditCard;


            var valid = true;
            if (!Stripe.card.validateCardNumber(cc.number)) {
                valid = false;
            }
            if (!Stripe.card.validateExpiry(cc.expiration.month, cc.expiration.year)) {
                valid = false;
            }
            if (!Stripe.card.validateCVC(cc.cvc)) {
                valid = false;
            }

            if(valid === false){
                alert('invalid card');
                return false;
            }

            Stripe.card.createToken({
                number: cc.number,
                cvc: cc.cvc,
                exp_month: cc.expiration.month,
                exp_year: cc.expiration.year,
                name: cc.name
            }, function (status, response) {
                if (response.error) {
                    return console.error(response.error);
                }
                instance.createSubscription(response);
            });
        },

        createSubscription: function (stripeResponse) {
            var instance = this;
            var payload = deepCopy(this.value);
            payload.token = stripeResponse;
            delete payload.creditCard;

            $.ajax({
                method: 'put',
                url: instance.context.apiURL('projectBilling'),
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(payload)
            }).done(function (data) {
                console.info(data);
            });
        }
    }
});