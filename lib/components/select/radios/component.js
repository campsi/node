'use strict';
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('select/dropdown', 'select/radios', function ($super) {
    return {
        getTagName: function () {
            return 'div';
        },
        getDefaultOptions: function () {
            return {
                createEmptyOption: false,
                options: []
            };
        },
        getDesignerFormOptions: function () {
            var options = $super.getDesignerFormOptions.call();
            options.fields.push({
                label: 'inline',
                type: 'checkbox',
                name: 'inline'
            });
            return options;
        },
        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(this, el, context, function () {
                instance.inputs = $(this.mountNode.find('input'));
                next();
            });
        },
        attachEvents: function () {
            var instance = this;
            instance.mountNode.on('change', 'input', function (e) {
                console.info("input change");
                instance.setValue($(e.target).val());
            });
        },
        createOption: function (value, label) {
            var $el = $('<label>');
            var $input = $('<input type="radio">').attr('name', this.id).attr('value', value);
            $el.append($input);
            $el.append($('<span>').text(label));
            this.inputs = this.inputs || [];
            this.inputs.push($input);
            return $el;
        },
        valueDidChange: function (next) {
            var v = this.value;
            var $input;
            $(this.inputs).each(function () {
                $input = $(this);
                $input.attr('checked', ($input.attr('value').toString() === v));
            });
            next();
        },
        optionsDidChange: function (next) {
            var instance = this;
            $super.optionsDidChange.call(this, function () {
                instance.mountNode.toggleClass('inline', instance.options.inline === true);
                next();
            });
        }
    };
});