var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

Campsi.extend('form/field', 'form/checkbox', function ($super) {
    return {
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.control.append($('<label><input type="checkbox"/><span></span></label>'));
                next.call(instance);
            });
        },

        attachEvents: function () {
            console.info("checkbox attach events");
            var instance = this;
            var $checkbox = instance.nodes.control.find('input[type=checkbox]');
            $checkbox.on('change', function () {
                instance.value = $checkbox.is(':checked');
                instance.trigger('change');
            });
        },

        optionsDidChange: function (next) {
            var instance = this;
            $super.optionsDidChange.call(instance, function () {
                instance.nodes.control.find('span').text(instance.options.label);
                next.call(instance);
            });
        },

        valueDidChange: function (next) {
            var instance = this;
            $super.valueDidChange(function () {
                instance.nodes.control.find('input[type=checkbox]').attr('checked', instance.value);
                next.call(instance);
            });
        }
    }
});