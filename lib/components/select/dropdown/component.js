var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'select/dropdown', function ($super) {
    return {

        getDefaultOptions: function () {
            return {
                options: []
            }
        },
        getTagName: function () {
            return 'select';
        },

        attachEvents: function () {
            var instance = this;
            this.mountNode.on('change', function () {
                instance.value = instance.mountNode.val();
                instance.trigger('change');
            });
        },

        optionsDidChange: function (next) {
            this.mountNode.empty();
            this.options.options.forEach(function (opt) {
                var $opt = this.createOption(opt.value, opt.label);
                this.mountNode.append($opt);
            }, this);
            next();
        },

        createOption: function (value, label) {
            var $option = $('<option>');
            $option.attr('value', value);
            $option.text(label);
            return $option;
        },

        valueDidChange: function (next) {
            this.mountNode.val(this.value);
            next();
        }

    }
});