var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var isBrowser = require('is-browser');

Campsi.extend('component', 'form/text', function ($super) {
    return {

        defaultValue: '',

        init: function (next) {
            $super.init.call(this, function () {
                this.nodes.input = $('<input type="text">');
                this.mountNode.append(this.nodes.input);
                next.call(this);
            });
        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'input': '> input'
            })
        },

        focus: function () {
            this.nodes.input.focus();
        },

        attachEvents: function () {
            var instance = this;

            this.nodes.input.on('change', function (event) {
                instance.value = $(this).val();
                instance.trigger('change', instance.value);
            });
        },

        valueDidChange: function (next) {
            this.nodes.input.val(this.value);
            next.call(this);
        }
    }
});