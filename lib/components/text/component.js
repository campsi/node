var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var isBrowser = require('is-browser');

module.exports = Campsi.extend('component', 'text', function ($super) {
    return {

        getDefaultValue: function () {
            return ''
        },

        getTagName: function () {
            return 'input'
        },

        init: function (next) {
            $super.init.call(this, function () {
                this.mountNode.attr('type', 'text');
                next.call(this);
            });
        },


        focus: function () {
            this.mountNode.focus();
        },

        attachEvents: function () {
            var instance = this;

            this.mountNode.on('change', function (event) {
                instance.value = $(this).val();
                instance.trigger('change', instance.value);
            });
        },

        valueDidChange: function (next) {
            this.mountNode.val(this.value);
            next.call(this);
        },

        optionsDidChange: function (next) {
            if (this.options.placeholder) {
                this.mountNode.attr('placeholder', this.options.placeholder);
            }
            this.mountNode.attr('disabled', (this.options.disabled));
            next();
        }
    }
});