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
                number: '',
                expiration: {
                    month: '',
                    year: ''
                },
                cvc: ''
            };
        },
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.newCardForm = $('<form class="new-card">');
                instance.nodes.currentCard = $('<div class="current-card">');
                instance.nodes.newCardForm.append('<div class="control number">' + '   <label>Card Number</label>' + '   <input name="number" type="text">' + '</div>');
                instance.nodes.newCardForm.append('<div class="line">' + '   <div class="control expiration">' + '       <label>Expiration</label>' + '       <input name="exp_month" type="text" maxlength="2" size="2">' + '       &nbsp;/&nbsp;' + '       <input name="exp_year" type="text" maxlength="4" size="4">' + '   </div>' + '   <div class="control cvc">' + '       <label>CVC Code</label>' + '       <input type="text" maxlength="3" size="3">' + '   </div>' + '</div>');
                instance.mountNode.append(instance.nodes.newCardForm);
                instance.mountNode.append(instance.nodes.currentCard);
                var d = new Date();
                var m = d.getMonth();
                m = m < 10 ? '0' + m.toString() : m.toString();
                instance.nodes.newCardForm.find('input[name=exp_year]').val(d.getFullYear());
                instance.nodes.newCardForm.find('input[name=exp_month]').val(m);
                next();
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
        optionsDidChange: function (next) {
            next();
        },
        valueDidChange: function (next) {
            next();
        }
    };
});