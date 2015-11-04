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
                instance.value = $checkbox.is(':checked');
                instance.trigger('change');
            });
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
            var instance = this;
            $super.valueDidChange(function () {
                instance.mountNode.find('input[type=checkbox]').attr('checked', instance.value);
                next.call(instance);
            });
        }
    }
});