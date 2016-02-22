var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'checkbox', function ($super) {
    return {

        getDesignerFormOptions: function () {
            return {
                fields: [{
                    name: 'checkboxText',
                    type: 'text',
                    label: 'checkbox text',
                    placeholder: 'leave empty to use the field\'s label'
                }]
            }
        },

        getDefaultValue: function () {
            return false
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.mountNode.append($('<label><input type="checkbox"/><span></span></label>'));
                next.call(instance);
            });
        },

        attachEvents: function () {
            //console.info("checkbox attach events");
            var instance = this;
            var $checkbox = instance.mountNode.find('input[type=checkbox]');
            $checkbox.on('change', function () {
                instance.setValue($checkbox.is(':checked'));
            }).on('focus', function () {
                instance.trigger('focus');
            }).on('blur', function () {
                instance.trigger('blur');
            });

            instance.mountNode.on('mouseover', function () {
                instance.trigger('focus');
            }).on('mouseout', function () {
                instance.trigger('blur');
            })
        },

        optionsDidChange: function (next) {
            var instance = this;
            $super.optionsDidChange.call(instance, function () {
                instance.mountNode.find('input');
                instance.mountNode.find('span').text(instance.options.checkboxText || instance.options.label);
                next.call(instance);
            });
        },

        valueDidChange: function (next) {
            this.mountNode.find('input[type=checkbox]').prop('checked', this.value);
            next();
        }
    }
});