'use strict';
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('component', 'payment/credit-card', function ($super) {
    return {
        getDefaultOptions: function () {
            return {};
        },
        getDefaultValue: function () {
            return {
                name: 'ROMAIN MEUSY',
                number: '4242 4242 4242 4242',
                expiration: {
                    month: '12',
                    year: '17'
                },
                cvc: '123'
            };
        },
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.newCardForm = $('<form class="new-card">');
                instance.nodes.currentCard = $('<div class="current-card">');
                instance.nodes.newCardForm.append('<div class="type"></div>');
                instance.nodes.newCardForm.append('<div class="control number">'
                    + '   <label>Card Number</label>'
                    + '   <input name="number" type="text">'
                    + '</div>');
                instance.nodes.newCardForm.append('<div class="line">'
                    + '   <div class="control expiration">'
                    + '       <label>Expiration</label>'
                    + '       <input name="exp_month" type="text" maxlength="2" size="2">'
                    + '       &nbsp;/&nbsp;'
                    + '       <input name="exp_year" type="text" maxlength="4" size="4">'
                    + '   </div>'
                    + '   <div class="control cvc">'
                    + '       <label>CVC Code</label>'
                    + '       <input type="text" name="cvc" maxlength="3" size="3">'
                    + '   </div>'
                    + '</div>');
                instance.nodes.newCardForm.append('<div class="control name">'
                    + '   <label>Card Holder</label>'
                    + '   <input name="name" type="text">'
                    + '</div>');


                instance.mountNode.append(instance.nodes.newCardForm);
                instance.mountNode.append(instance.nodes.currentCard);
                //var d = new Date();
                //var m = d.getMonth();
                //m = m < 10 ? '0' + m.toString() : m.toString();
                //instance.nodes.newCardForm.find('input[name=exp_year]').val(d.getFullYear());
                //instance.nodes.newCardForm.find('input[name=exp_month]').val(m);
                next();
            });
        },

        attachEvents: function () {
            var instance = this;
            instance.mountNode.on('keyup', 'input', function () {
                var newValue = {
                    name: instance.mountNode.find('input[name=name]').val(),
                    number: instance.mountNode.find('input[name=number]').val(),
                    expiration: {
                        month: instance.mountNode.find('input[name=exp_month]').val(),
                        year: instance.mountNode.find('input[name=exp_year]').val()
                    },
                    cvc: instance.mountNode.find('input[name=cvc]').val()
                };
                instance.setValue(newValue);
            });

            instance.valueDidChange(function(){

            });
        },
        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                next();
            });
        },
        getNodePaths: function () {
            return {
                newCardForm: '.new-card',
                currentCard: '.current-card'
            };
        },

        valueDidChange: function (next) {
            var instance = this;

            console.info(instance.value);

            var type = Stripe.card.cardType(instance.value.number);
            instance.mountNode.find('.new-card .type').attr('data-brand', type);
            instance.mountNode.find('input[name=name]').val(instance.value.name);
            instance.mountNode.find('input[name=number]').val(instance.value.number);
            instance.mountNode.find('input[name=exp_month]').val(instance.value.expiration.month);
            instance.mountNode.find('input[name=exp_year]').val(instance.value.expiration.year);
            instance.mountNode.find('input[name=cvc]').val(instance.value.cvc);
            next();
        }
    };
});