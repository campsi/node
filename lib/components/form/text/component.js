var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var isBrowser = require('is-browser');

Campsi.extend('form/field', 'form/text', function ($super) {
    return {

        defaultValue: '',

        init: function (next) {
            $super.init.call(this, function () {
                this.nodes.input = $('<input type="text">');
                this.nodes.control.append(this.nodes.input);
                if (next) next.call(this);
            });
        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'input': '> .control > input'
            })
        },

        focus: function () {
            this.nodes.input.focus();
        },

        attachEvents: function () {
            var instance = this;

            if (isBrowser) {
                this.nodes.input.on('change', function (event) {
                    instance.value = $(this).val();
                    instance.trigger('change', instance.value);
                });
            }
        },

        valueDidChange: function (next) {
            this.nodes.input.val(this.value);
            if (next) next.call(this);
        }
    }
});